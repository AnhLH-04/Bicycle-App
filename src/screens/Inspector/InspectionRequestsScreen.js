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
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import InspectorAPI from '../../services/inspector.api';
import { BicycleAPI } from '../../services/api';

const InspectionRequestsScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState(route?.params?.filter || 'pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectionRequests, setInspectionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInspections();
    
    // // Auto-refresh every 5 seconds
    // const refreshInterval = setInterval(() => {
    //   fetchInspections();
    // }, 5000);
    
    // // Cleanup interval on unmount
    // return () => clearInterval(refreshInterval);
  }, [activeTab]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      
      let data;
      if (activeTab === 'pending' || activeTab === 'all') {
        // Fetch pending inspections
        const response = await InspectorAPI.getPendingInspections();
        data = response?.data || [];
      } else {
        // Fetch my inspections with status filter
        const statusMap = {
          'in-progress': 'pending',
          'completed': 'approved',
        };
        const status = statusMap[activeTab] || activeTab;
        const response = await InspectorAPI.getMyInspections(status);
        data = response?.data || [];
      }      
      // Fetch bicycle details for each inspection
      const transformedData = await Promise.all(
        data.map(async (item) => {
          let bicycle = null;
          
          // Try to fetch bicycle details by ID
          if (item.bicycleId) {
            try {
              const bicycleResponse = await BicycleAPI.getBicycleById(item.bicycleId);
              bicycle = bicycleResponse?.data || null;
              console.log(`✅ Fetched bicycle for inspection ${item._id}:`, bicycle?.title);
            } catch (error) {
              console.warn(`⚠️ Could not fetch bicycle ${item.bicycleId}:`, error.message);
            }
          }
          
          // Fetch seller info
          let sellerInfo = null;
          const sellerId = bicycle?.sellerId || item.sellerId || null;
          if (sellerId) {
            try {
              const sellerResponse = await InspectorAPI.getUserById(sellerId);
              sellerInfo = sellerResponse?.data || sellerResponse || null;
            } catch (error) {
              console.warn(`⚠️ Could not fetch seller ${sellerId}:`, error.message);
            }
          }

          // Transform data with bicycle info
          return {
            id: item._id,
            bikeTitle: bicycle?.title || `Xe #${item.bicycleId?.slice(-6) || 'N/A'}`,
            bikeModel: bicycle?.specifications?.model || bicycle?.title || `Xe #${item.bicycleId?.slice(-6) || 'N/A'}`,
            bikeBrand: bicycle?.specifications?.brand || 'N/A',
            bikeImage: bicycle?.media?.mainImage || bicycle?.media?.images?.[0] || 'https://bizweb.dktcdn.net/100/412/747/products/xe-dap-dua-magicbros-s600-5.jpg?v=1731484215820',
            sellerName: sellerInfo ? `${sellerInfo.firstName || ''} ${sellerInfo.lastName || ''}`.trim() || 'N/A' : 'N/A',
            sellerPhone: sellerInfo?.phone || 'N/A',
            requestType: item.inspectionType || 'onsite',
            address: bicycle?.location ? 
              `${bicycle.location.address || ''}, ${bicycle.location.district || ''}, ${bicycle.location.city || ''}`.trim() 
              : 'N/A',
            requestDate: item.createdAt,
            status: item.verdict || 'pending',
            price: item.inspectionFee || 0,
            priority: 'medium',
            inspectionData: item,
            bicycle: bicycle, // Store full bicycle data
            bicycleId: item.bicycleId,
          };
        })
      );

      setInspectionRequests(transformedData);
      console.log(`✅ Loaded ${transformedData.length} inspections`);
    } catch (error) {
      console.error('❌ Error fetching inspections:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách kiểm định. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInspections();
    setRefreshing(false);
  };

  const filterRequests = () => {
    let filtered = inspectionRequests;

    if (activeTab !== 'all') {
      filtered = filtered.filter(req => req.status === activeTab);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        req =>
          req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.bikeModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: COLORS.warning,
      accepted: COLORS.info,
      'in-progress': COLORS.primary,
      completed: COLORS.success,
      cancelled: COLORS.error,
    };
    return colors[status] || COLORS.gray;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xử lý',
      accepted: 'Đã chấp nhận',
      'in-progress': 'Đang kiểm định',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: COLORS.error,
      medium: COLORS.warning,
      low: COLORS.success,
    };
    return colors[priority] || COLORS.gray;
  };

  const renderRequestCard = ({ item }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => navigation.navigate('InspectionDetail', { inspectionId: item.id })}
    >
      {/* Priority Badge */}
      {item.priority === 'high' && (
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Icon name="alert" size={12} color={COLORS.white} />
          <Text style={styles.priorityText}>Ưu tiên</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <Image source={{ uri: item.bikeImage }} style={styles.bikeImage} />
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.bikeModel}>{item.bikeTitle}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="identifier" size={14} color={COLORS.gray} />
            <Text style={styles.infoText}>{item.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="account" size={14} color={COLORS.gray} />
            <Text style={styles.infoText}>{item.sellerName}</Text>
            <Icon name="phone" size={14} color={COLORS.gray} style={{ marginLeft: 12 }} />
            <Text style={styles.infoText}>{item.sellerPhone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon
              name={item.requestType === 'on-site' ? 'map-marker' : 'laptop'}
              size={14}
              color={COLORS.gray}
            />
            <Text style={styles.infoText}>
              {item.requestType === 'on-site' ? 'Tại chỗ' : 'Trực tuyến'}
            </Text>
            {item.requestType === 'on-site' && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.infoText} numberOfLines={1}>
                  {item.address}
                </Text>
              </>
            )}
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={14} color={COLORS.gray} />
              <Text style={styles.infoText}>
                {new Date(item.requestDate).toLocaleString('vi-VN')}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Icon name="cash" size={14} color={COLORS.primary} />
              <Text style={styles.priceText}>
                {item.price === 0 ? 'Miễn phí' : `${(item.price / 1000).toFixed(0)}K`}
              </Text>
            </View>
          </View>

          {/* Action Buttons for pending status */}
          {item.status === 'pending' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => handleAcceptRequest(item.id)}
              >
                <Icon name="check" size={16} color={COLORS.white} />
                <Text style={styles.actionBtnText}>Chấp nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleRejectRequest(item.id)}
              >
                <Icon name="close" size={16} color={COLORS.white} />
                <Text style={styles.actionBtnText}>Từ chối</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Continue button for in-progress */}
          {item.status === 'in-progress' && (
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => navigation.navigate('PerformInspection', { inspectionId: item.id })}
            >
              <Text style={styles.continueBtnText}>Tiếp tục kiểm định</Text>
              <Icon name="arrow-right" size={16} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleAcceptRequest = (id) => {
    // TODO: API call to accept request
    console.log('Accept request:', id);
  };

  const handleRejectRequest = (id) => {
    // TODO: API call to reject request
    console.log('Reject request:', id);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <View style={styles.container}>
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

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Chờ xử lý
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'in-progress' && styles.activeTab]}
          onPress={() => setActiveTab('in-progress')}
        >
          <Text style={[styles.tabText, activeTab === 'in-progress' && styles.activeTabText]}>
            Đang làm
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Hoàn thành
          </Text>
        </TouchableOpacity>
      </View>

      {/* Requests List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filterRequests()}
          renderItem={renderRequestCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="clipboard-text-off-outline" size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>Không có yêu cầu nào</Text>
          </View>
        }
        />
      )}
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    fontSize: 15,
    color: COLORS.dark,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  priorityBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  priorityText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  bikeImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bikeModel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
    flexWrap: 'wrap',
  },
  infoText: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 6,
    flex: 1,
  },
  separator: {
    color: '#CCC',
    marginHorizontal: 6,
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptBtn: {
    backgroundColor: COLORS.success,
  },
  rejectBtn: {
    backgroundColor: COLORS.error,
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
    fontWeight: '500',
  },
});

export default InspectionRequestsScreen;
