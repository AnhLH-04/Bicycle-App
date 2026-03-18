import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import InspectorAPI from '../../services/inspector.api';

const DisputeResolutionScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [evidenceModalVisible, setEvidenceModalVisible] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disputes, setDisputes] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [activeTab]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const statusMap = {
        'pending': 'pending',
        'investigating': 'under_review',
        'resolved': 'resolved',
      };
      const status = statusMap[activeTab] || 'pending';
      
      try {
        const response = await InspectorAPI.getDisputes(status);
        
        if (response?.data) {
          const transformed = response.data.map(item => ({
            id: item._id,
            inspectionId: item.transactionId || 'N/A',
            bikeModel: item.bicycle?.model || 'N/A',
            bikeImage: item.bicycle?.media?.photos?.[0] || 'https://via.placeholder.com/100',
            disputeType: item.reason || 'other',
            reportedBy: item.reporterId ? 'buyer' : 'seller',
            buyerName: item.reporter?.name || 'N/A',
            sellerName: item.reportedUser?.name || 'N/A',
            reportDate: item.createdAt,
            description: item.description || '',
            status: item.status === 'under_review' ? 'investigating' : item.status,
            priority: 'medium',
            evidence: {
              buyerPhotos: item.evidence?.photos || [],
              inspectionReport: item.inspectorReport || {},
            },
            resolution: item.resolution?.notes,
            resolvedDate: item.resolvedAt,
          }));
          setDisputes(transformed);
        }
      } catch (apiError) {
        console.warn('⚠️ Disputes API not available, using empty list');
        setDisputes([]);
      }
    } catch (error) {
      console.error('❌ Error fetching disputes:', error);
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDisputes();
    setRefreshing(false);
  };

  // Mock data for fallback
  const mockDisputes = [
    {
      id: 'DSP-2024-001',
      inspectionId: 'INS-2024-015',
      bikeModel: 'Giant TCR Advanced Pro',
      bikeImage: 'https://via.placeholder.com/100',
      disputeType: 'condition-mismatch', // 'condition-mismatch', 'missing-parts', 'fake-listing', 'other'
      reportedBy: 'buyer',
      buyerName: 'Nguyễn Văn C',
      sellerName: 'Nguyễn Văn B',
      reportDate: '2024-02-02T15:30:00',
      description: 'Xe nhận được không đúng với báo cáo kiểm định. Phanh không hoạt động tốt như mô tả.',
      status: 'pending', // 'pending', 'investigating', 'resolved', 'rejected'
      priority: 'high',
      evidence: {
        buyerPhotos: ['https://via.placeholder.com/200', 'https://via.placeholder.com/200'],
        inspectionReport: {
          frameCondition: 'good',
          brakeCondition: 'good',
          drivetrainCondition: 'excellent',
        },
      },
    },
    {
      id: 'DSP-2024-002',
      inspectionId: 'INS-2024-013',
      bikeModel: 'Specialized S-Works Tarmac',
      bikeImage: 'https://via.placeholder.com/100',
      disputeType: 'missing-parts',
      reportedBy: 'buyer',
      buyerName: 'Trần Thị D',
      sellerName: 'Lê Văn E',
      reportDate: '2024-02-01T10:20:00',
      description: 'Thiếu bộ phụ kiện như đã mô tả trong báo cáo. Không có đèn và chuông xe.',
      status: 'investigating',
      priority: 'medium',
      evidence: {
        buyerPhotos: ['https://via.placeholder.com/200'],
        inspectionReport: {
          frameCondition: 'fair',
          brakeCondition: 'fair',
          drivetrainCondition: 'good',
        },
      },
    },
    {
      id: 'DSP-2024-003',
      inspectionId: 'INS-2024-012',
      bikeModel: 'Trek Domane SL 7',
      bikeImage: 'https://via.placeholder.com/100',
      disputeType: 'condition-mismatch',
      reportedBy: 'buyer',
      buyerName: 'Phạm Văn F',
      sellerName: 'Hoàng Thị G',
      reportDate: '2024-01-30T14:45:00',
      description: 'Khung xe có vết nứt không được ghi nhận trong báo cáo kiểm định.',
      status: 'resolved',
      priority: 'high',
      resolution: 'Đã xác nhận có vết nứt. Người mua được hoàn tiền đầy đủ.',
      resolvedDate: '2024-01-31T16:00:00',
      evidence: {
        buyerPhotos: ['https://via.placeholder.com/200', 'https://via.placeholder.com/200'],
        inspectionReport: {
          frameCondition: 'good',
          brakeCondition: 'excellent',
          drivetrainCondition: 'good',
        },
      },
    },
  ];

  const filterDisputes = () => {
    let filtered = disputes;

    if (activeTab !== 'all') {
      filtered = filtered.filter((dispute) => dispute.status === activeTab);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (dispute) =>
          dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dispute.bikeModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dispute.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: COLORS.warning,
      investigating: COLORS.info,
      resolved: COLORS.success,
      rejected: COLORS.error,
    };
    return colors[status] || COLORS.gray;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xử lý',
      investigating: 'Đang điều tra',
      resolved: 'Đã giải quyết',
      rejected: 'Đã từ chối',
    };
    return texts[status] || status;
  };

  const getDisputeTypeText = (type) => {
    const texts = {
      'condition-mismatch': 'Sai tình trạng',
      'missing-parts': 'Thiếu phụ kiện',
      'fake-listing': 'Tin giả mạo',
      other: 'Khác',
    };
    return texts[type] || type;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: COLORS.error,
      medium: COLORS.warning,
      low: COLORS.success,
    };
    return colors[priority] || COLORS.gray;
  };

  const handleViewEvidence = (dispute) => {
    setSelectedDispute(dispute);
    setEvidenceModalVisible(true);
  };

  const handleProvideEvidence = (disputeId) => {
    Alert.alert(
      'Cung cấp bằng chứng',
      'Vui lòng chuẩn bị báo cáo kiểm định gốc và hình ảnh liên quan.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tiếp tục',
          onPress: () => {
            // TODO: Navigate to evidence submission screen
            console.log('Provide evidence for:', disputeId);
          },
        },
      ]
    );
  };

  const handleResolveDispute = (disputeId, resolution) => {
    Alert.alert(
      'Xác nhận giải quyết',
      `Bạn có chắc chắn muốn đánh dấu tranh chấp này là "${resolution}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            // TODO: API call to resolve dispute
            console.log('Resolve dispute:', disputeId, resolution);
            Alert.alert('Thành công', 'Tranh chấp đã được giải quyết.');
          },
        },
      ]
    );
  };

  const renderDisputeCard = ({ item }) => (
    <TouchableOpacity
      style={styles.disputeCard}
      onPress={() => navigation.navigate('DisputeDetail', { disputeId: item.id })}
    >
      {/* Priority Badge */}
      {item.priority === 'high' && (
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Icon name="alert" size={12} color={COLORS.white} />
          <Text style={styles.priorityText}>Khẩn cấp</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <Image source={{ uri: item.bikeImage }} style={styles.bikeImage} />
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.bikeModel}>{item.bikeModel}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="identifier" size={14} color={COLORS.gray} />
            <Text style={styles.infoText}>{item.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="alert-circle" size={14} color={COLORS.error} />
            <Text style={styles.infoText}>{getDisputeTypeText(item.disputeType)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="account" size={14} color={COLORS.gray} />
            <Text style={styles.infoText}>
              Người mua: {item.buyerName} vs Người bán: {item.sellerName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="calendar" size={14} color={COLORS.gray} />
            <Text style={styles.infoText}>
              {new Date(item.reportDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Action Buttons */}
          {item.status === 'pending' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.evidenceBtn]}
                onPress={() => handleViewEvidence(item)}
              >
                <Icon name="file-document" size={16} color={COLORS.primary} />
                <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Xem bằng chứng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.provideBtn]}
                onPress={() => handleProvideEvidence(item.id)}
              >
                <Icon name="plus" size={16} color={COLORS.success} />
                <Text style={[styles.actionBtnText, { color: COLORS.success }]}>Cung cấp BC</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.status === 'investigating' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.resolveBtn]}
                onPress={() => handleResolveDispute(item.id, 'buyer-favor')}
              >
                <Icon name="check" size={16} color={COLORS.white} />
                <Text style={styles.actionBtnText}>Ủng hộ người mua</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleResolveDispute(item.id, 'seller-favor')}
              >
                <Icon name="close" size={16} color={COLORS.white} />
                <Text style={styles.actionBtnText}>Ủng hộ người bán</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.status === 'resolved' && item.resolution && (
            <View style={styles.resolutionContainer}>
              <Icon name="check-circle" size={16} color={COLORS.success} />
              <Text style={styles.resolutionText}>{item.resolution}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const EvidenceModal = () => (
    <Modal
      visible={evidenceModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setEvidenceModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bằng chứng tranh chấp</Text>
            <TouchableOpacity onPress={() => setEvidenceModalVisible(false)}>
              <Icon name="close" size={24} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          {selectedDispute && (
            <View style={styles.evidenceContent}>
              <Text style={styles.evidenceSection}>Ảnh từ người mua:</Text>
              <View style={styles.photosGrid}>
                {(selectedDispute.evidence?.buyerPhotos || []).map((photo, index) => (
                  <Image key={index} source={{ uri: photo }} style={styles.evidencePhoto} />
                ))}
              </View>

              <Text style={styles.evidenceSection}>Báo cáo kiểm định gốc:</Text>
              <View style={styles.reportCard}>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Khung xe:</Text>
                  <Text style={styles.reportValue}>
                    {selectedDispute.evidence.inspectionReport.frameCondition}
                  </Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Phanh:</Text>
                  <Text style={styles.reportValue}>
                    {selectedDispute.evidence.inspectionReport.brakeCondition}
                  </Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Bộ truyền động:</Text>
                  <Text style={styles.reportValue}>
                    {selectedDispute.evidence.inspectionReport.drivetrainCondition}
                  </Text>
                </View>
              </View>

              <Text style={styles.evidenceSection}>Ghi chú của bạn:</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Nhập nhận xét của bạn về tranh chấp này..."
                multiline
                numberOfLines={4}
                value={resolutionNotes}
                onChangeText={setResolutionNotes}
              />

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => {
                  // TODO: Submit notes
                  Alert.alert('Thành công', 'Ghi chú đã được gửi.');
                  setEvidenceModalVisible(false);
                }}
              >
                <Text style={styles.submitBtnText}>Gửi ghi chú</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm tranh chấp..."
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
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Tất cả</Text>
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
              style={[styles.tab, activeTab === 'investigating' && styles.activeTab]}
              onPress={() => setActiveTab('investigating')}
            >
              <Text style={[styles.tabText, activeTab === 'investigating' && styles.activeTabText]}>
                Đang xử lý
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'resolved' && styles.activeTab]}
              onPress={() => setActiveTab('resolved')}
            >
              <Text style={[styles.tabText, activeTab === 'resolved' && styles.activeTabText]}>
                Đã giải quyết
              </Text>
            </TouchableOpacity>
          </View>

          {/* Disputes List */}
          <FlatList
            data={filterDisputes()}
            renderItem={renderDisputeCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="scale-balance" size={64} color={COLORS.lightGray} />
                <Text style={styles.emptyText}>Không có tranh chấp nào</Text>
              </View>
            }
          />

          {/* Evidence Modal */}
          <EvidenceModal />
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  disputeCard: {
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
  priorityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
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
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: COLORS.dark,
    marginTop: 8,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
  },
  evidenceBtn: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  provideBtn: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.white,
  },
  resolveBtn: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  rejectBtn: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  resolutionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.success + '20',
    borderRadius: 8,
  },
  resolutionText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 8,
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  evidenceContent: {
    padding: 20,
  },
  evidenceSection: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  evidencePhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  reportCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reportLabel: {
    fontSize: 13,
    color: COLORS.gray,
  },
  reportValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
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

export default DisputeResolutionScreen;
