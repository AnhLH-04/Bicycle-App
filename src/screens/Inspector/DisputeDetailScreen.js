import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Dimensions,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import InspectorAPI from '../../services/inspector.api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ===================== CONSTANTS =====================

const DISPUTE_REASON_LABELS = {
  item_not_received: 'Không nhận được hàng',
  item_not_as_described: 'Hàng không đúng mô tả',
  damaged_item: 'Hàng bị hư hỏng',
  counterfeit_parts: 'Linh kiện giả',
  seller_unresponsive: 'Người bán không phản hồi',
  buyer_refusing_delivery: 'Người mua từ chối nhận hàng',
  other: 'Lý do khác',
};

const DISPUTE_STATUS_CONFIG = {
  open: { label: 'Mới mở', color: COLORS.warning, icon: 'alert-circle-outline' },
  under_review: { label: 'Đang xem xét', color: '#8B5CF6', icon: 'eye-outline' },
  awaiting_evidence: { label: 'Chờ bằng chứng', color: '#F97316', icon: 'clock-outline' },
  resolved_buyer_favor: { label: 'Có lợi người mua', color: COLORS.success, icon: 'check-circle-outline' },
  resolved_seller_favor: { label: 'Có lợi người bán', color: COLORS.success, icon: 'check-circle-outline' },
  resolved_partial_refund: { label: 'Hoàn tiền một phần', color: '#06B6D4', icon: 'check-circle-outline' },
  closed: { label: 'Đã đóng', color: COLORS.gray, icon: 'close-circle-outline' },
};

// ===================== COMPONENT =====================

const DisputeDetailScreen = ({ route, navigation }) => {
  const { disputeId } = route.params;

  const [dispute, setDispute] = useState(null);
  const [inspectionReport, setInspectionReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [comparisonNotes, setComparisonNotes] = useState('');
  const [loadingReport, setLoadingReport] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCompareView, setShowCompareView] = useState(false);

  useEffect(() => {
    fetchDisputeDetail();
  }, [disputeId]);

  const fetchDisputeDetail = async () => {
    try {
      setLoading(true);
      const response = await InspectorAPI.getDisputeDetail(disputeId);

      if (response?.data) {
        setDispute(response.data);

        // If dispute already has inspector evidence, pre-fill the notes
        if (response.data.inspectorReport?.comparisonNotes) {
          setComparisonNotes(response.data.inspectorReport.comparisonNotes);
        }

        // Try to fetch the original inspection report
        // We need bicycleId from the transaction
        await fetchOriginalReport(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching dispute detail:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết tranh chấp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOriginalReport = async (disputeData) => {
    try {
      setLoadingReport(true);

      // Strategy 1: If inspector already submitted evidence, use the linked reportId
      if (disputeData.inspectorReport?.reportId) {
        try {
          const res = await InspectorAPI.getInspectionDetail(disputeData.inspectorReport.reportId);
          if (res?.data) {
            setInspectionReport(res.data);
            return;
          }
        } catch (e) {
          console.warn('⚠️ Could not fetch by reportId:', e.message);
        }
      }

      // Strategy 2: Backend does NOT populate transactionId in getDisputeById,
      // so transactionId is just a raw ObjectId string. We cannot get bicycleId directly.
      // However, if the dispute has transactionId as a string, we can't use it to
      // fetch bicycle info without a separate transaction API.
      // For now, this path is not available — the inspector report will be auto-linked
      // when they submit evidence via PATCH /inspector-evidence.
      console.log('ℹ️ No linked inspection report yet. Inspector can still submit evidence.');
    } catch (error) {
      console.warn('⚠️ Could not fetch original inspection report:', error.message);
    } finally {
      setLoadingReport(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDisputeDetail();
    setRefreshing(false);
  }, [disputeId]);

  const handleSubmitEvidence = async () => {
    if (!comparisonNotes.trim()) {
      Alert.alert('Lưu ý', 'Vui lòng nhập ghi chú so sánh trước khi gửi.');
      return;
    }

    if (comparisonNotes.trim().length < 20) {
      Alert.alert('Lưu ý', 'Ghi chú so sánh phải có ít nhất 20 ký tự.');
      return;
    }

    Alert.alert(
      'Xác nhận gửi ý kiến',
      'Bạn có chắc chắn muốn gửi ý kiến kiểm định cho tranh chấp này? Hành động này sẽ được ghi nhận vào timeline.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi',
          style: 'default',
          onPress: async () => {
            try {
              setSubmitting(true);
              const response = await InspectorAPI.addDisputeEvidence(
                disputeId,
                comparisonNotes.trim()
              );

              if (response?.data) {
                setDispute(response.data);
                Alert.alert(
                  'Thành công! ✅',
                  'Ý kiến kiểm định đã được gửi thành công. Admin sẽ xem xét và đưa ra quyết định.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('❌ Error submitting evidence:', error);
              Alert.alert('Lỗi', error.message || 'Không thể gửi ý kiến. Vui lòng thử lại.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  // ===================== HELPERS =====================

  const getStatusConfig = (status) => {
    return DISPUTE_STATUS_CONFIG[status] || { label: status, color: COLORS.gray, icon: 'help-circle-outline' };
  };

  const getReasonLabel = (reason) => {
    return DISPUTE_REASON_LABELS[reason] || reason || 'Không xác định';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const canAddEvidence = () => {
    if (!dispute) return false;
    // Inspector can only add evidence if no comparisonNotes exist yet
    return !dispute.inspectorReport?.comparisonNotes;
  };

  const openImage = (uri) => {
    setSelectedImage(uri);
    setImageModalVisible(true);
  };

  // ===================== RENDER SECTIONS =====================

  const renderStatusHeader = () => {
    if (!dispute) return null;
    const config = getStatusConfig(dispute.status);

    return (
      <View style={[styles.statusHeader, { backgroundColor: config.color + '15' }]}>
        <Icon name={config.icon} size={20} color={config.color} />
        <Text style={[styles.statusHeaderText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  const renderDisputeInfo = () => {
    if (!dispute) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin tranh chấp</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="identifier" size={16} color={COLORS.gray} />
            <Text style={styles.infoLabel}>Mã tranh chấp</Text>
            <Text style={styles.infoValue}>{dispute._id?.slice(-8)?.toUpperCase()}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Icon name="alert-decagram" size={16} color={COLORS.error} />
            <Text style={styles.infoLabel}>Lý do</Text>
            <Text style={[styles.infoValue, { color: COLORS.error }]}>
              {getReasonLabel(dispute.reason)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Icon name="calendar" size={16} color={COLORS.gray} />
            <Text style={styles.infoLabel}>Ngày tạo</Text>
            <Text style={styles.infoValue}>{formatDate(dispute.createdAt)}</Text>
          </View>

          {dispute.assignedAdminId && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Icon name="shield-account" size={16} color="#8B5CF6" />
                <Text style={styles.infoLabel}>Admin xử lý</Text>
                <Text style={styles.infoValue}>Đã giao</Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderDescription = () => {
    if (!dispute?.description) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mô tả từ người mua</Text>
        <View style={styles.descriptionCard}>
          <Icon name="format-quote-open" size={20} color={COLORS.primary + '60'} />
          <Text style={styles.descriptionText}>{dispute.description}</Text>
        </View>
      </View>
    );
  };

  const renderBuyerEvidence = () => {
    if (!dispute?.evidence) return null;

    const photos = dispute.evidence.photos || [];
    const videos = dispute.evidence.videos || [];
    const documents = dispute.evidence.documents || [];

    if (photos.length === 0 && videos.length === 0 && documents.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bằng chứng từ người mua</Text>

        {photos.length > 0 && (
          <View>
            <Text style={styles.subLabel}>
              <Icon name="image-multiple" size={14} color={COLORS.gray} /> Ảnh ({photos.length})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosRow}
            >
              {photos.map((photo, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => openImage(photo)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: photo }}
                    style={styles.evidencePhoto}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {videos.length > 0 && (
          <View style={styles.mediaInfo}>
            <Icon name="video" size={16} color={COLORS.gray} />
            <Text style={styles.mediaInfoText}>{videos.length} video đính kèm</Text>
          </View>
        )}

        {documents.length > 0 && (
          <View style={styles.mediaInfo}>
            <Icon name="file-document" size={16} color={COLORS.gray} />
            <Text style={styles.mediaInfoText}>{documents.length} tài liệu đính kèm</Text>
          </View>
        )}
      </View>
    );
  };

  const renderOriginalReport = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Báo cáo kiểm định gốc</Text>
          {inspectionReport && (
            <TouchableOpacity
              style={styles.compareButton}
              onPress={() => setShowCompareView(!showCompareView)}
            >
              <Icon name="compare" size={16} color={COLORS.primary} />
              <Text style={styles.compareButtonText}>
                {showCompareView ? 'Ẩn so sánh' : 'So sánh'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingReport ? (
          <View style={styles.reportLoadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.reportLoadingText}>Đang tải báo cáo gốc...</Text>
          </View>
        ) : inspectionReport ? (
          <View style={styles.reportCard}>
            {/* Basic Info */}
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Loại kiểm định</Text>
              <Text style={styles.reportValue}>
                {inspectionReport.inspectionType === 'onsite' ? 'Tại chỗ' : inspectionReport.inspectionType === 'online' ? 'Trực tuyến' : (inspectionReport.inspectionType || 'N/A')}
              </Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Đánh giá tổng thể</Text>
              <Text style={styles.reportValue}>
                {inspectionReport.overallRating != null ? `${inspectionReport.overallRating}/10` : 'N/A'}
              </Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Kết luận</Text>
              <View style={[
                styles.verdictBadge,
                {
                  backgroundColor: (inspectionReport.verdict === 'approved' || inspectionReport.verdict === 'approved_with_conditions')
                    ? COLORS.success + '20'
                    : inspectionReport.verdict === 'pending'
                      ? COLORS.warning + '20'
                      : COLORS.error + '20'
                }
              ]}>
                <Text style={[
                  styles.verdictText,
                  {
                    color: (inspectionReport.verdict === 'approved' || inspectionReport.verdict === 'approved_with_conditions')
                      ? COLORS.success
                      : inspectionReport.verdict === 'pending'
                        ? COLORS.warning
                        : COLORS.error
                  }
                ]}>
                  {inspectionReport.verdict === 'approved' ? 'Đạt chuẩn' : inspectionReport.verdict === 'approved_with_conditions' ? 'Đạt có điều kiện' : inspectionReport.verdict === 'pending' ? 'Đang chờ' : 'Không đạt'}
                </Text>
              </View>
            </View>

            {/* Technical Checks */}
            {inspectionReport.technicalChecks && (
              <>
                <View style={styles.componentsDivider} />
                <Text style={styles.componentsTitle}>Kiểm tra kỹ thuật</Text>
                {Object.entries(inspectionReport.technicalChecks).map(([key, value]) => {
                  if (!value) return null;
                  const labelMap = { frame: 'Khung xe', brakes: 'Phanh', drivetrain: 'Hệ truyền động', wheels: 'Bánh xe', suspension: 'Hệ giảm xóc' };
                  const label = labelMap[key] || key;
                  const condition = value?.condition || 'N/A';
                  const conditionLabelMap = { excellent: 'Xuất sắc', good: 'Tốt', fair: 'Trung bình', poor: 'Kém', 'n/a': 'N/A' };
                  return (
                    <View key={key}>
                      <View style={styles.componentRow}>
                        <Text style={styles.componentLabel}>{label}</Text>
                        <Text style={styles.componentValue}>{conditionLabelMap[condition] || condition}</Text>
                      </View>
                      {value?.issues?.length > 0 && (
                        <Text style={styles.componentIssues}>⚠️ {value.issues.join(', ')}</Text>
                      )}
                      {value?.notes && (
                        <Text style={styles.componentNotes}>{value.notes}</Text>
                      )}
                    </View>
                  );
                })}
              </>
            )}

            {/* Recommendations */}
            {inspectionReport.recommendations && (
              <>
                <View style={styles.componentsDivider} />
                <Text style={styles.componentsTitle}>Khuyến nghị</Text>
                <Text style={styles.reportNotes}>{inspectionReport.recommendations}</Text>
              </>
            )}

            {/* Media - Photos */}
            {inspectionReport.media?.photos?.length > 0 && (
              <>
                <View style={styles.componentsDivider} />
                <Text style={styles.componentsTitle}>Ảnh kiểm định ({inspectionReport.media.photos.length})</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photosRow}
                >
                  {inspectionReport.media.photos.map((photo, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => openImage(photo)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: photo }}
                        style={styles.evidencePhoto}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Media - Videos */}
            {inspectionReport.media?.videos?.length > 0 && (
              <View style={[styles.mediaInfo, { marginTop: 8 }]}>
                <Icon name="video" size={16} color={COLORS.gray} />
                <Text style={styles.mediaInfoText}>{inspectionReport.media.videos.length} video kiểm định</Text>
              </View>
            )}

            {/* Valid Until */}
            {inspectionReport.validUntil && (
              <View style={[styles.reportRow, { marginTop: 8 }]}>
                <Text style={styles.reportLabel}>Hiệu lực đến</Text>
                <Text style={styles.reportValue}>{formatDate(inspectionReport.validUntil)}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.reportNotAvailable}>
            <Icon name="file-question" size={32} color={COLORS.gray} />
            <Text style={styles.reportNotAvailableText}>
              Chưa có báo cáo kiểm định gốc
            </Text>
            <Text style={styles.reportNotAvailableSubtext}>
              Báo cáo sẽ tự động được liên kết khi bạn gửi ý kiến kiểm định
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderInspectorEvidence = () => {
    if (!dispute) return null;

    const hasEvidence = dispute.inspectorReport?.comparisonNotes;

    return (
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Ý kiến kiểm định viên</Text>
          {hasEvidence && (
            <View style={styles.submittedBadge}>
              <Icon name="check-circle" size={14} color={COLORS.success} />
              <Text style={styles.submittedBadgeText}>Đã gửi</Text>
            </View>
          )}
        </View>

        {hasEvidence ? (
          <View style={styles.existingEvidenceCard}>
            <View style={styles.existingEvidenceHeader}>
              <Icon name="account-check" size={20} color={COLORS.primary} />
              <Text style={styles.existingEvidenceLabel}>Ghi chú so sánh</Text>
            </View>
            <Text style={styles.existingEvidenceText}>
              {dispute.inspectorReport.comparisonNotes}
            </Text>
            {dispute.inspectorReport.reportId && (
              <View style={styles.linkedReportInfo}>
                <Icon name="link-variant" size={14} color={COLORS.gray} />
                <Text style={styles.linkedReportText}>
                  Liên kết báo cáo: {dispute.inspectorReport.reportId.toString().slice(-8).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.evidenceInputCard}>
            <View style={styles.evidenceInputHeader}>
              <Icon name="pencil-box-outline" size={20} color={COLORS.primary} />
              <Text style={styles.evidenceInputLabel}>
                Nhập ghi chú so sánh giữa khiếu nại và báo cáo kiểm định
              </Text>
            </View>

            <TextInput
              style={styles.comparisonInput}
              placeholder="So sánh với báo cáo kiểm định ban đầu, khung xe có thêm 3 vết trầy mới không có trong báo cáo. Phanh trước bị mòn nhiều hơn mức báo cáo..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={6}
              value={comparisonNotes}
              onChangeText={setComparisonNotes}
              textAlignVertical="top"
              editable={!submitting}
            />

            <View style={styles.charCountRow}>
              <Text style={[
                styles.charCountText,
                comparisonNotes.length < 20 ? { color: COLORS.error } : { color: COLORS.success }
              ]}>
                {comparisonNotes.length} / tối thiểu 20 ký tự
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!comparisonNotes.trim() || comparisonNotes.length < 20 || submitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitEvidence}
              disabled={!comparisonNotes.trim() || comparisonNotes.length < 20 || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="send" size={18} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Gửi ý kiến kiểm định</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.noteText}>
              * Chỉ cần nhập ghi chú so sánh (comparisonNotes). Backend sẽ tự động liên kết báo cáo kiểm định gốc.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderTimeline = () => {
    if (!dispute?.timeline?.length) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch sử xử lý</Text>
        <View style={styles.timelineContainer}>
          {dispute.timeline.map((entry, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot}>
                <View style={[
                  styles.timelineDotInner,
                  index === 0 && { backgroundColor: COLORS.primary },
                ]} />
              </View>
              {index < dispute.timeline.length - 1 && (
                <View style={styles.timelineLine} />
              )}
              <View style={styles.timelineContent}>
                <Text style={styles.timelineAction}>{entry.action}</Text>
                {entry.notes && (
                  <Text style={styles.timelineNotes}>{entry.notes}</Text>
                )}
                <Text style={styles.timelineDate}>{formatDate(entry.timestamp)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderResolution = () => {
    if (!dispute?.resolution) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kết quả giải quyết</Text>
        <View style={styles.resolutionCard}>
          {dispute.resolution.decision && (
            <View style={styles.resolutionRow}>
              <Icon name="gavel" size={16} color={COLORS.primary} />
              <Text style={styles.resolutionLabel}>Quyết định</Text>
              <Text style={styles.resolutionValue}>{dispute.resolution.decision}</Text>
            </View>
          )}
          {dispute.resolution.refundAmount != null && (
            <View style={styles.resolutionRow}>
              <Icon name="cash-refund" size={16} color={COLORS.success} />
              <Text style={styles.resolutionLabel}>Hoàn tiền</Text>
              <Text style={[styles.resolutionValue, { color: COLORS.success }]}>
                {dispute.resolution.refundAmount.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          )}
          {dispute.resolution.notes && (
            <View style={styles.resolutionNotesContainer}>
              <Text style={styles.resolutionNotesLabel}>Ghi chú Admin:</Text>
              <Text style={styles.resolutionNotesText}>{dispute.resolution.notes}</Text>
            </View>
          )}
          {dispute.resolution.resolvedAt && (
            <Text style={styles.resolutionDate}>
              Giải quyết lúc: {formatDate(dispute.resolution.resolvedAt)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  // ===================== IMAGE MODAL =====================

  const renderImageModal = () => (
    <Modal
      visible={imageModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setImageModalVisible(false)}
    >
      <View style={styles.imageModalOverlay}>
        <TouchableOpacity
          style={styles.imageModalClose}
          onPress={() => setImageModalVisible(false)}
        >
          <Icon name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        {selectedImage && (
          <Image
            source={{ uri: selectedImage }}
            style={styles.imageModalFull}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
  );

  // ===================== MAIN RENDER =====================

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải chi tiết tranh chấp...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dispute) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Không tìm thấy tranh chấp</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chi tiết tranh chấp</Text>
          <Text style={styles.headerSubtitle}>
            #{dispute._id?.slice(-8)?.toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Icon name="refresh" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderStatusHeader()}
          {renderDisputeInfo()}
          {renderDescription()}
          {renderBuyerEvidence()}
          {renderOriginalReport()}
          {renderInspectorEvidence()}
          {renderResolution()}
          {renderTimeline()}

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {renderImageModal()}
    </SafeAreaView>
  );
};

// ===================== STYLES =====================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.dark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  refreshButton: {
    padding: 4,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.dark,
    marginTop: 12,
    marginBottom: 20,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  statusHeaderText: {
    fontSize: 15,
    fontWeight: '700',
  },
  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  // Info Card
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  infoLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  // Description
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.dark,
    lineHeight: 21,
    marginTop: 4,
  },
  // Evidence photos
  subLabel: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 8,
  },
  photosRow: {
    gap: 8,
    paddingBottom: 4,
  },
  evidencePhoto: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
  },
  mediaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  mediaInfoText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  // Compare Button
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 16,
  },
  compareButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Report Card
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  reportLabel: {
    fontSize: 13,
    color: COLORS.gray,
  },
  reportValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
  },
  verdictBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verdictText: {
    fontSize: 12,
    fontWeight: '600',
  },
  componentsDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  componentsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 6,
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  componentLabel: {
    fontSize: 12,
    color: COLORS.gray,
    flex: 1,
  },
  componentValue: {
    fontSize: 12,
    color: COLORS.dark,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  componentIssues: {
    fontSize: 11,
    color: COLORS.warning,
    marginLeft: 4,
    marginBottom: 2,
  },
  componentNotes: {
    fontSize: 11,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginLeft: 4,
    marginBottom: 4,
  },
  reportNotes: {
    fontSize: 13,
    color: COLORS.dark,
    lineHeight: 19,
  },
  reportLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportLoadingText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  reportNotAvailable: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportNotAvailableText: {
    fontSize: 14,
    color: COLORS.dark,
    marginTop: 8,
  },
  reportNotAvailableSubtext: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  // Inspector Evidence Section
  existingEvidenceCard: {
    backgroundColor: COLORS.success + '08',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  existingEvidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  existingEvidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  existingEvidenceText: {
    fontSize: 14,
    color: COLORS.dark,
    lineHeight: 21,
  },
  linkedReportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.success + '30',
  },
  linkedReportText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  submittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.success + '15',
    borderRadius: 12,
  },
  submittedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
  },
  // Evidence Input
  evidenceInputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  evidenceInputHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  evidenceInputLabel: {
    fontSize: 13,
    color: COLORS.dark,
    flex: 1,
    lineHeight: 18,
  },
  comparisonInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: COLORS.dark,
    minHeight: 130,
    backgroundColor: COLORS.lightGray,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
    marginBottom: 12,
  },
  charCountText: {
    fontSize: 11,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  noteText: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 10,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  // Timeline
  timelineContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 50,
  },
  timelineDot: {
    width: 24,
    alignItems: 'center',
    paddingTop: 2,
  },
  timelineDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gray,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 14,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.border,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 16,
  },
  timelineAction: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
  },
  timelineNotes: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  timelineDate: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 3,
  },
  // Resolution
  resolutionCard: {
    backgroundColor: COLORS.success + '08',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  resolutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  resolutionLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray,
  },
  resolutionValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
  },
  resolutionNotesContainer: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.success + '30',
  },
  resolutionNotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 4,
  },
  resolutionNotesText: {
    fontSize: 13,
    color: COLORS.dark,
    lineHeight: 19,
  },
  resolutionDate: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'right',
  },
  // Image Modal
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    right: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  imageModalFull: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH - 32,
    borderRadius: 8,
  },
});

export default DisputeDetailScreen;
