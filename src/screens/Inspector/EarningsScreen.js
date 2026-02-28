import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
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

const EarningsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [earningsData, setEarningsData] = useState(null);

  useEffect(() => {
    fetchEarnings();
  }, [selectedPeriod]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      
      // Try to fetch earnings data
      const response = await InspectorAPI.getEarnings(selectedPeriod);
      
      if (response?.data) {
        setEarningsData(response.data);
      } else {
        // Fallback: Use profile data and my inspections
        const [profileRes, inspectionsRes] = await Promise.all([
          InspectorAPI.getProfile(),
          InspectorAPI.getMyInspections(),
        ]);
        
        // Calculate earnings from inspections
        const inspections = inspectionsRes?.data || [];
        const total = inspections.reduce((sum, item) => sum + (item.inspectionFee || 0), 0);
        const freeCount = inspections.filter(item => item.inspectionFee === 0).length;
        
        setEarningsData({
          total: total,
          thisMonth: total,
          thisWeek: 0,
          today: 0,
          totalInspections: profileRes?.data?.reputation?.totalInspections || inspections.length,
          freeInspections: freeCount,
          paidInspections: inspections.length - freeCount,
          averagePerInspection: inspections.length > 0 ? Math.round(total / inspections.length) : 0,
          pendingPayment: 0,
          monthlyBreakdown: [],
          recentTransactions: inspections.slice(0, 10).map(item => ({
            id: item._id,
            inspectionId: item._id,
            bikeModel: item.bicycle?.model || 'N/A',
            date: item.createdAt,
            amount: item.inspectionFee || 0,
            status: 'completed',
            type: item.inspectionType || 'onsite',
          })),
          feeStructure: {
            onSiteFirstTime: 0,
            onSiteRegular: 200000,
            onlineFirstTime: 0,
            onlineRegular: 150000,
            reInspectionFee: 200000,
            disputeConsultation: 100000,
          },
        });
      }
    } catch (error) {
      console.error('❌ Error fetching earnings:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu thu nhập.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEarnings();
    setRefreshing(false);
  };

  // Mock data for initial state
  const mockEarningsData = {
    total: 5450000,
    thisMonth: 2450000,
    thisWeek: 800000,
    today: 200000,
    totalInspections: 45,
    freeInspections: 8,
    paidInspections: 37,
    averagePerInspection: 121111,
    pendingPayment: 400000,
    
    // Monthly breakdown
    monthlyBreakdown: [
      { month: '01/2024', amount: 1200000, inspections: 8 },
      { month: '02/2024', amount: 2450000, inspections: 15 },
      { month: '03/2024', amount: 1800000, inspections: 12 },
    ],
    
    // Recent transactions
    recentTransactions: [
      {
        id: 'TXN-2024-045',
        inspectionId: 'INS-2024-015',
        bikeModel: 'Giant TCR Advanced Pro',
        date: '2024-02-02T10:30:00',
        amount: 200000,
        status: 'completed',
        type: 'on-site',
      },
      {
        id: 'TXN-2024-044',
        inspectionId: 'INS-2024-014',
        bikeModel: 'Trek Emonda SLR 9',
        date: '2024-02-01T14:20:00',
        amount: 200000,
        status: 'completed',
        type: 'on-site',
      },
      {
        id: 'TXN-2024-043',
        inspectionId: 'INS-2024-013',
        bikeModel: 'Specialized S-Works',
        date: '2024-01-30T09:15:00',
        amount: 0,
        status: 'completed',
        type: 'online',
        note: 'Lần kiểm định đầu tiên - Miễn phí',
      },
    ],
    
    // Fee structure
    feeStructure: {
      onSiteFirstTime: 0,
      onSiteRegular: 200000,
      onlineFirstTime: 0,
      onlineRegular: 150000,
      reInspectionFee: 200000,
      disputeConsultation: 100000,
    },
  };

  const StatCard = ({ icon, label, value, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        <Icon name={icon} size={32} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const TransactionItem = ({ transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionId}>{transaction.id}</Text>
          <Text style={styles.bikeModel}>{transaction.bikeModel}</Text>
          <Text style={styles.transactionDate}>
            {new Date(transaction.date).toLocaleString('vi-VN')}
          </Text>
          {transaction.note && <Text style={styles.transactionNote}>{transaction.note}</Text>}
        </View>
        <View style={styles.transactionAmount}>
          <Text style={[styles.amountText, transaction.amount === 0 && styles.freeAmount]}>
            {transaction.amount === 0 ? 'Miễn phí' : `${(transaction.amount / 1000).toFixed(0)}K`}
          </Text>
          <View style={styles.transactionType}>
            <Icon
              name={transaction.type === 'on-site' ? 'map-marker' : 'laptop'}
              size={12}
              color={COLORS.gray}
            />
            <Text style={styles.typeText}>
              {transaction.type === 'on-site' ? 'Tại chỗ' : 'Online'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const MonthlyChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Thu nhập theo tháng</Text>
      {(earningsData.monthlyBreakdown || []).map((item, index) => {
        const maxAmount = Math.max(...(earningsData.monthlyBreakdown || []).map((i) => i.amount));
        const barWidth = (item.amount / maxAmount) * 100;
        
        return (
          <View key={index} style={styles.chartRow}>
            <Text style={styles.chartMonth}>{item.month}</Text>
            <View style={styles.chartBarContainer}>
              <View style={[styles.chartBar, { width: `${barWidth}%` }]} />
            </View>
            <Text style={styles.chartAmount}>{(item.amount / 1000).toFixed(0)}K</Text>
          </View>
        );
      })}
    </View>
  );

  const FeeStructureCard = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Cơ cấu phí kiểm định</Text>
      <View style={styles.feeCard}>
        <FeeRow
          icon="gift"
          label="Lần đầu (Tại chỗ)"
          amount={(earningsData.feeStructure || {}).onSiteFirstTime || 0}
        />
        <FeeRow
          icon="map-marker"
          label="Tại chỗ (Thường)"
          amount={(earningsData.feeStructure || {}).onSiteRegular || 0}
        />
        <FeeRow
          icon="gift"
          label="Lần đầu (Online)"
          amount={(earningsData.feeStructure || {}).onlineFirstTime || 0}
        />
        <FeeRow
          icon="laptop"
          label="Online (Thường)"
          amount={(earningsData.feeStructure || {}).onlineRegular || 0}
        />
        <FeeRow
          icon="refresh"
          label="Kiểm định lại"
          amount={(earningsData.feeStructure || {}).reInspectionFee || 0}
        />
        <FeeRow
          icon="scale-balance"
          label="Tư vấn tranh chấp"
          amount={(earningsData.feeStructure || {}).disputeConsultation || 0}
        />
      </View>
    </View>
  );

  const FeeRow = ({ icon, label, amount }) => (
    <View style={styles.feeRow}>
      <View style={styles.feeLeft}>
        <Icon name={icon} size={16} color={COLORS.gray} />
        <Text style={styles.feeLabel}>{label}</Text>
      </View>
      <Text style={styles.feeAmount}>
        {amount === 0 ? 'Miễn phí' : `${(amount / 1000).toFixed(0)}K`}
      </Text>
    </View>
  );

  // Show loading while data is being fetched
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // Show error if no data
  if (!earningsData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="alert-circle" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Không thể tải dữ liệu thu nhập</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEarnings}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightGray, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lightGray} />
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
      {/* Summary Cards */}
      <View style={styles.summarySection}>
        <StatCard
          icon="cash-multiple"
          label="Tổng thu nhập"
          value={`${((earningsData.total || 0) / 1000000).toFixed(1)}M`}
          color={COLORS.primary}
          subtitle="Tất cả thời gian"
        />
        <StatCard
          icon="calendar-month"
          label="Thu nhập tháng này"
          value={`${((earningsData.thisMonth || 0) / 1000).toFixed(0)}K`}
          color={COLORS.success}
          subtitle={`${earningsData.totalInspections || 0} kiểm định`}
        />
      </View>

      <View style={styles.summarySection}>
        <StatCard
          icon="calendar-week"
          label="Tuần này"
          value={`${((earningsData.thisWeek || 0) / 1000).toFixed(0)}K`}
          color={COLORS.info}
        />
        <StatCard
          icon="calendar-today"
          label="Hôm nay"
          value={`${((earningsData.today || 0) / 1000).toFixed(0)}K`}
          color={COLORS.warning}
        />
      </View>

      {/* Pending Payment */}
      {(earningsData.pendingPayment || 0) > 0 && (
        <View style={styles.pendingCard}>
          <Icon name="clock-alert" size={24} color={COLORS.warning} />
          <View style={styles.pendingInfo}>
            <Text style={styles.pendingLabel}>Đang chờ thanh toán</Text>
            <Text style={styles.pendingAmount}>
              {((earningsData.pendingPayment || 0) / 1000).toFixed(0)}K VNĐ
            </Text>
          </View>
          <TouchableOpacity style={styles.viewDetailsBtn}>
            <Text style={styles.viewDetailsText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thống kê</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statItemValue}>{earningsData.totalInspections || 0}</Text>
            <Text style={styles.statItemLabel}>Tổng kiểm định</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statItemValue}>{earningsData.freeInspections || 0}</Text>
            <Text style={styles.statItemLabel}>Miễn phí</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statItemValue}>{earningsData.paidInspections || 0}</Text>
            <Text style={styles.statItemLabel}>Có phí</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statItemValue}>
              {((earningsData.averagePerInspection || 0) / 1000).toFixed(0)}K
            </Text>
            <Text style={styles.statItemLabel}>TB/kiểm định</Text>
          </View>
        </View>
      </View>

      {/* Monthly Chart */}
      {(earningsData.monthlyBreakdown || []).length > 0 && (
        <View style={styles.section}>
          <MonthlyChart />
        </View>
      )}

      {/* Fee Structure */}
      <FeeStructureCard />

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.transactionList}>
          {(earningsData.recentTransactions || []).map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </View>
      </View>

      {/* Withdrawal Button */}
      <TouchableOpacity style={styles.withdrawalButton}>
        <Icon name="bank-transfer" size={20} color={COLORS.white} />
        <Text style={styles.withdrawalButtonText}>Yêu cầu rút tiền</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 10,
    color: COLORS.lightGray,
    marginTop: 2,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  pendingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  pendingLabel: {
    fontSize: 14,
    color: COLORS.dark,
  },
  pendingAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.warning,
    marginTop: 4,
  },
  viewDetailsBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statItemLabel: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  chartContainer: {
    marginTop: 8,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartMonth: {
    width: 60,
    fontSize: 12,
    color: COLORS.gray,
  },
  chartBarContainer: {
    flex: 1,
    height: 24,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  chartAmount: {
    width: 60,
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.dark,
    textAlign: 'right',
  },
  feeCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  feeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  feeLabel: {
    fontSize: 14,
    color: COLORS.dark,
    marginLeft: 8,
  },
  feeAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  transactionList: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  transactionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bikeModel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  transactionNote: {
    fontSize: 11,
    color: COLORS.info,
    marginTop: 4,
    fontStyle: 'italic',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  freeAmount: {
    color: COLORS.success,
  },
  transactionType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  typeText: {
    fontSize: 11,
    color: COLORS.gray,
    marginLeft: 4,
  },
  withdrawalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    margin: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  withdrawalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EarningsScreen;
