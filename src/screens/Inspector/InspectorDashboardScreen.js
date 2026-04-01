import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import InspectorAPI from '../../services/inspector.api';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const InspectorDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [pendingInspections, setPendingInspections] = useState([]);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    completedToday: 0,
    totalEarnings: 0,
    activeDisputes: 0,
    monthlyInspections: 0,
  });

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 5 seconds
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 5000);
    
    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile, pending inspections, and open disputes in parallel
      const [profileRes, pendingRes, disputesRes] = await Promise.all([
        InspectorAPI.getProfile(),
        InspectorAPI.getPendingInspections(),
        InspectorAPI.getDisputes({ status: 'open' }),
      ]);

      if (profileRes?.data) {
        setProfile(profileRes.data);
        
        // Update stats from profile
        const reputation = profileRes.data.reputation || {};
        setStats(prev => ({
          ...prev,
          monthlyInspections: reputation.totalInspections || 0,
        }));
      }

      if (pendingRes?.data) {
        setPendingInspections(pendingRes.data);
        setStats(prev => ({
          ...prev,
          pendingRequests: pendingRes.data.length || 0,
        }));
      }

      if (disputesRes?.data) {
        setStats(prev => ({
          ...prev,
          activeDisputes: disputesRes.data.length || 0,
        }));
      }

      console.log('✅ Dashboard data loaded');
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData().finally(() => setRefreshing(false));
  }, []);

  const StatCard = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statIcon}>
        <Icon name={icon} size={32} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  const QuickActionButton = ({ icon, label, onPress, color }) => (
    <TouchableOpacity style={styles.quickActionBtn} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={28} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Xin chào,</Text>
          <Text style={styles.inspectorName}>
            {profile?.firstName && profile?.lastName 
              ? `${profile.firstName} ${profile.lastName}`
              : user?.email || 'Inspector'}
          </Text>
          <Text style={styles.role}>Người kiểm định</Text>
          {profile?.reputation && (
            <Text style={styles.rating}>
              ⭐ {profile.reputation.rating?.toFixed(1) || '0.0'} ({profile.reputation.totalReviews || 0} đánh giá)
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Icon name="bell-outline" size={24} color={COLORS.dark} />
          {stats.pendingRequests > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{stats.pendingRequests}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Statistics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thống kê</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="clock-outline"
            label="Yêu cầu đang chờ"
            value={stats.pendingRequests}
            color={COLORS.warning}
            onPress={() => navigation.navigate('Requests', { filter: 'pending' })}
          />
          {/* <StatCard
            icon="check-circle-outline"
            label="Hoàn thành hôm nay"
            value={stats.completedToday}
            color={COLORS.success}
            onPress={() => navigation.navigate('History', { filter: 'today' })}
          />
          {/* <StatCard
            icon="cash"
            label="Thu nhập"
            value={`${(stats.totalEarnings / 1000).toFixed(0)}K`}
            color={COLORS.primary}
            onPress={() => navigation.navigate('Earnings')}
          /> */}
          <StatCard
            icon="alert-circle-outline"
            label="Tranh chấp"
            value={stats.activeDisputes}
            color={COLORS.error}
            onPress={() => navigation.navigate('DisputeResolution')}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hành động nhanh</Text>
        <View style={styles.quickActions}>
          <QuickActionButton
            icon="clipboard-text-search"
            label="Yêu cầu mới"
            color={COLORS.primary}
            onPress={() => navigation.navigate('Requests', { filter: 'pending' })}
          />
          <QuickActionButton
            icon="plus-circle"
            label="Thực hiện kiểm tra"
            color={COLORS.success}
            onPress={() => navigation.navigate('Requests', { filter: 'in_progress' })}
          />
          <QuickActionButton
            icon="history"
            label="Lịch sử"
            color={COLORS.info}
            onPress={() => navigation.navigate('History')}
          />
          <QuickActionButton
            icon="scale-balance"
            label="Tranh chấp"
            color={COLORS.warning}
            onPress={() => navigation.navigate('DisputeResolution')}
          />
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityList}>
          <ActivityItem
            icon="check-circle"
            iconColor={COLORS.success}
            title="Hoàn thành kiểm định"
            subtitle="Giant TCR Advanced Pro - ID: #INS-2024-001"
            time="10 phút trước"
          />
          <ActivityItem
            icon="clock-alert"
            iconColor={COLORS.warning}
            title="Yêu cầu kiểm định mới"
            subtitle="Trek Emonda SLR 9 - Tại chỗ"
            time="1 giờ trước"
          />
          <ActivityItem
            icon="alert"
            iconColor={COLORS.error}
            title="Tranh chấp cần xử lý"
            subtitle="Specialized S-Works - ID: #DSP-445"
            time="3 giờ trước"
          />
        </View>
      </View>

      {/* Monthly Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hiệu suất tháng này</Text>
        <View style={styles.performanceCard}>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Tổng kiểm định:</Text>
            <Text style={styles.performanceValue}>{stats.monthlyInspections} xe</Text>
          </View>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Tỷ lệ hoàn thành:</Text>
            <Text style={styles.performanceValue}>96%</Text>
          </View>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Đánh giá trung bình:</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color={COLORS.warning} />
              <Text style={styles.performanceValue}>4.8/5.0</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const ActivityItem = ({ icon, iconColor, title, subtitle, time }) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIcon, { backgroundColor: iconColor + '20' }]}>
      <Icon name={icon} size={20} color={iconColor} />
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activitySubtitle}>{subtitle}</Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '400',
  },
  inspectorName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 4,
  },
  role: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    color: COLORS.warning,
    marginTop: 6,
    fontWeight: '500',
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    marginRight: 14,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.dark,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionBtn: {
    width: (width - 44) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
  },
  activitySubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
  },
  activityTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  performanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  performanceLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  performanceValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default InspectorDashboardScreen;
