import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import InspectorAPI from '../../services/inspector.api';

const InspectionHistoryScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inspectionHistory, setInspectionHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, [filterPeriod]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch both inspections and bicycles in parallel
      const [inspectionsResponse, bicyclesResponse] = await Promise.all([
        InspectorAPI.getMyInspections(),
        InspectorAPI.getAllBicycles(),
      ]);
      
      if (inspectionsResponse?.data) {
        // Create a map of bicycles by ID for quick lookup
        const bicyclesMap = {};
        if (bicyclesResponse?.data) {
          bicyclesResponse.data.forEach(bicycle => {
            bicyclesMap[bicycle._id] = bicycle;
          });
        }

        // Extract unique seller IDs from bicycles
        const sellerIds = [...new Set(
          Object.values(bicyclesMap)
            .map(bicycle => bicycle.sellerId)
            .filter(Boolean)
        )];

        // // Fetch all seller details in parallel
        // const sellerPromises = sellerIds.map(sellerId => 
        //   UserAPI.getUserById(sellerId)
        // );
        // const sellerResponses = await Promise.all(sellerPromises);

        // Create a map of sellers by ID
        // const sellersMap = {};
        // sellerResponses.forEach((response, index) => {
        //   if (response?.data) {
        //     sellersMap[sellerIds[index]] = response.data;
        //   }
        // });

        const transformed = inspectionsResponse.data.map(item => {
          const bicycle = bicyclesMap[item.bicycleId] || {};
          // const seller = sellersMap[bicycle.sellerId] || {};
          
          return {
            id: item._id,
            bikeModel: bicycle.title || 'N/A',
            bikeBrand: bicycle.specifications?.brand || 'N/A',
            bikeImage: bicycle.media?.photos?.[0] || item.media?.photos?.[0] || 'https://via.placeholder.com/100',
            inspectionDate: item.createdAt,
            overallCondition: mapVerdictToCondition(item.verdict),
            certificationIssued: item.verdict === 'approved' || item.verdict === 'approved_with_conditions',
            certificationExpiry: item.validUntil,
            inspectionFee: 0, // Not provided in API response
            sellerName: bicycle.sellerName || 'N/A',
            inspectorRating: item.overallRating || 0,
            reportViews: bicycle.views || 0,
            overallRating: item.overallRating || 0,
            bicycleId: item.bicycleId,
            inspectionType: item.inspectionType,
            verdict: item.verdict,
            technicalChecks: item.technicalChecks,
            recommendations: item.recommendations,
            isPaid: item.isPaid,
            bicyclePrice: bicycle.price || 0,
            sellerId: bicycle.sellerId,
          };
        });
        
        setInspectionHistory(transformed);
      }
    } catch (error) {
      console.error('❌ Error fetching history:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Map verdict to condition for display
  const mapVerdictToCondition = (verdict) => {
    switch (verdict) {
      case 'approved':
        return 'excellent';
      case 'approved_with_conditions':
        return 'good';
      case 'rejected':
        return 'poor';
      case 'pending':
      default:
        return 'fair';
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const filterByPeriod = (data) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return data.filter((item) => {
      const itemDate = new Date(item.inspectionDate);
      switch (filterPeriod) {
        case 'today':
          return itemDate >= today;
        case 'week':
          return itemDate >= weekAgo;
        case 'month':
          return itemDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const filterBySearch = (data) => {
    if (!searchQuery) return data;
    return data.filter(
      (item) =>
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bikeModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredData = () => {
    let filtered = inspectionHistory;
    filtered = filterByPeriod(filtered);
    filtered = filterBySearch(filtered);
    return filtered;
  };

  const getConditionColor = (condition) => {
    const colors = {
      excellent: COLORS.success,
      good: COLORS.info,
      fair: COLORS.warning,
      poor: COLORS.error,
    };
    return colors[condition] || COLORS.gray;
  };

  const getConditionText = (condition) => {
    const texts = {
      excellent: 'Xuất sắc',
      good: 'Tốt',
      fair: 'Khá',
      poor: 'Kém',
    };
    return texts[condition] || condition;
  };

  const isCertificationExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const renderHistoryCard = ({ item }) => (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => navigation.navigate('InspectionDetail', { 
        inspectionId: item.id,
        inspectionData: item,
        isCompleted: true 
      })}
    >
      <View style={styles.cardContent}>
        <Image source={{ uri: item.bikeImage }} style={styles.bikeImage} />
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.bikeModel} numberOfLines={1}>
              {item.bikeModel}
            </Text>
            {item.certificationIssued && (
              <View
                style={[
                  styles.certBadge,
                  isCertificationExpired(item.certificationExpiry) && styles.certBadgeExpired,
                ]}
              >
                <Icon
                  name="certificate"
                  size={12}
                  color={isCertificationExpired(item.certificationExpiry) ? COLORS.error : COLORS.success}
                />
              </View>
            )}
          </View>

          <View style={styles.infoRow}>
            <Icon name="identifier" size={14} color={COLORS.gray} />
            <Text style={styles.infoText}>{item.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="account" size={14} color={COLORS.gray} />
            <Text style={styles.infoText}>{item.sellerName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="calendar" size={14} color={COLORS.gray} />
            <Text style={styles.infoText}>
              {new Date(item.inspectionDate).toLocaleDateString('vi-VN')}
            </Text>
            <Text style={styles.separator}>•</Text>
            <Icon name="clock" size={14} color={COLORS.gray} />
            <Text style={styles.infoText}>
              {new Date(item.inspectionDate).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.conditionContainer}>
              <View
                style={[
                  styles.conditionDot,
                  { backgroundColor: getConditionColor(item.overallCondition) },
                ]}
              />
              <Text style={styles.conditionText}>{getConditionText(item.overallCondition)}</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Icon name="eye" size={14} color={COLORS.gray} />
                <Text style={styles.statText}>{item.reportViews}</Text>
              </View>
              <View style={styles.stat}>
                <Icon name="star" size={14} color={COLORS.warning} />
                <Text style={styles.statText}>{item.inspectorRating}</Text>
              </View>
              <View style={styles.stat}>
                <Icon name="cash" size={14} color={COLORS.primary} />
                <Text style={styles.statText}>
                  {item.inspectionFee === 0 ? 'Free' : `${(item.inspectionFee / 1000).toFixed(0)}K`}
                </Text>
              </View>
            </View>
          </View>

          {item.certificationExpiry && !isCertificationExpired(item.certificationExpiry) && (
            <View style={styles.expiryInfo}>
              <Icon name="clock-alert-outline" size={12} color={COLORS.warning} />
              <Text style={styles.expiryText}>
                Hết hạn: {new Date(item.certificationExpiry).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const PeriodFilter = () => (
    <View style={styles.periodFilter}>
      {[
        { key: 'all', label: 'Tất cả' },
        { key: 'today', label: 'Hôm nay' },
        { key: 'week', label: 'Tuần này' },
        { key: 'month', label: 'Tháng này' },
      ].map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodBtn,
            filterPeriod === period.key && styles.periodBtnActive,
          ]}
          onPress={() => setFilterPeriod(period.key)}
        >
          <Text
            style={[
              styles.periodBtnText,
              filterPeriod === period.key && styles.periodBtnTextActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const StatsSummary = () => {
    const data = getFilteredData();
    const totalInspections = data.length;
    const totalEarnings = data.reduce((sum, item) => sum + item.inspectionFee, 0);
    const avgRating = data.length > 0
      ? (data.reduce((sum, item) => sum + item.inspectorRating, 0) / data.length).toFixed(1)
      : 0;
    const certifiedCount = data.filter((item) => item.certificationIssued).length;

    return (
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalInspections}</Text>
          <Text style={styles.statLabel}>Kiểm định</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{certifiedCount}</Text>
          <Text style={styles.statLabel}>Đã cấp nhãn</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{avgRating}</Text>
          <Text style={styles.statLabel}>Đánh giá TB</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{(totalEarnings / 1000).toFixed(0)}K</Text>
          <Text style={styles.statLabel}>Thu nhập</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm theo ID, tên xe, người bán..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
          </View>

          {/* Period Filter */}
          <PeriodFilter />

          {/* Stats Summary */}
          <StatsSummary />

          {/* History List */}
          <FlatList
            data={getFilteredData()}
            renderItem={renderHistoryCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="history" size={64} color={COLORS.lightGray} />
                <Text style={styles.emptyText}>Không có lịch sử kiểm định</Text>
              </View>
            }
          />
        </>
      )}
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  periodFilter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  periodBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  periodBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodBtnText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
  },
  periodBtnTextActive: {
    color: COLORS.white,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  listContainer: {
    padding: 16,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  bikeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bikeModel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    flex: 1,
  },
  certBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certBadgeExpired: {
    backgroundColor: COLORS.error + '20',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
  },
  separator: {
    color: COLORS.lightGray,
    marginHorizontal: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  conditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  expiryText: {
    fontSize: 11,
    color: COLORS.warning,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
});

export default InspectionHistoryScreen;
