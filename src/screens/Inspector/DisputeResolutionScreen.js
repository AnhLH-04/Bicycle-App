import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import InspectorAPI from '../../services/inspector.api';

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

// Map tab keys to backend status values
const TAB_STATUS_MAP = {
  all: null,
  under_review: 'under_review',
  open: 'open',
  resolved: null, // will filter locally for resolved_*
};

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'under_review', label: 'Cần xem xét' },
  { key: 'open', label: 'Mới mở' },
  { key: 'resolved', label: 'Đã giải quyết' },
];

// ===================== COMPONENT =====================

const DisputeResolutionScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disputes, setDisputes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    fetchDisputes();
  }, [activeTab]);

  const fetchDisputes = async (page = 1) => {
    try {
      setLoading(true);

      const params = { page, limit: 20 };
      const backendStatus = TAB_STATUS_MAP[activeTab];
      if (backendStatus) {
        params.status = backendStatus;
      }

      const response = await InspectorAPI.getDisputes(params);

      if (response?.data) {
        let disputeList = Array.isArray(response.data) ? response.data : [];

        // For "resolved" tab, filter locally for all resolved statuses
        if (activeTab === 'resolved') {
          disputeList = disputeList.filter(d =>
            d.status?.startsWith('resolved_') || d.status === 'closed'
          );
        }

        setDisputes(disputeList);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setDisputes([]);
      }
    } catch (error) {
      console.error('❌ Error fetching disputes:', error);
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDisputes();
    setRefreshing(false);
  }, [activeTab]);

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

  const hasInspectorEvidence = (dispute) => {
    return dispute.inspectorReport && dispute.inspectorReport.comparisonNotes;
  };

  // ===================== FILTER =====================

  const filteredDisputes = () => {
    let list = disputes;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d =>
        d._id?.toLowerCase().includes(q) ||
        d.reason?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        getReasonLabel(d.reason).toLowerCase().includes(q)
      );
    }

    return list;
  };

  // ===================== RENDER =====================

  const renderStatusBadge = (status) => {
    const config = getStatusConfig(status);
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
        <Icon name={config.icon} size={12} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
      </View>
    );
  };

  const renderDisputeCard = ({ item }) => {
    const statusConfig = getStatusConfig(item.status);
    const needsEvidence = item.status === 'under_review' && !hasInspectorEvidence(item);

    return (
      <TouchableOpacity
        style={styles.disputeCard}
        onPress={() => navigation.navigate('DisputeDetail', { disputeId: item._id })}
        activeOpacity={0.7}
      >
        {/* Top accent bar */}
        <View style={[styles.cardAccent, { backgroundColor: statusConfig.color }]} />

        <View style={styles.cardBody}>
          {/* Header row */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.idContainer}>
                <Icon name="pound" size={14} color={COLORS.primary} />
                <Text style={styles.disputeId} numberOfLines={1}>
                  {item._id?.slice(-8)?.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
            {renderStatusBadge(item.status)}
          </View>

          {/* Reason */}
          <View style={styles.reasonRow}>
            <Icon name="alert-decagram" size={16} color={COLORS.error} />
            <Text style={styles.reasonText}>{getReasonLabel(item.reason)}</Text>
          </View>

          {/* Description */}
          {item.description ? (
            <Text style={styles.descriptionText} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          {/* Evidence photos count */}
          {item.evidence?.photos?.length > 0 && (
            <View style={styles.evidenceRow}>
              <Icon name="image-multiple" size={14} color={COLORS.gray} />
              <Text style={styles.evidenceCountText}>
                {item.evidence.photos.length} ảnh bằng chứng
              </Text>
            </View>
          )}

          {/* Inspector evidence indicator */}
          <View style={styles.cardFooter}>
            {hasInspectorEvidence(item) ? (
              <View style={styles.evidenceBadge}>
                <Icon name="check-circle" size={14} color={COLORS.success} />
                <Text style={[styles.evidenceBadgeText, { color: COLORS.success }]}>
                  Đã có ý kiến kiểm định
                </Text>
              </View>
            ) : needsEvidence ? (
              <View style={[styles.evidenceBadge, styles.evidenceBadgeWarning]}>
                <Icon name="pencil-plus" size={14} color="#F97316" />
                <Text style={[styles.evidenceBadgeText, { color: '#F97316' }]}>
                  Cần cung cấp ý kiến
                </Text>
              </View>
            ) : (
              <View style={styles.evidenceBadge}>
                <Icon name="information-outline" size={14} color={COLORS.gray} />
                <Text style={[styles.evidenceBadgeText, { color: COLORS.gray }]}>
                  Xem chi tiết
                </Text>
              </View>
            )}

            <Icon name="chevron-right" size={20} color={COLORS.gray} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Icon name="scale-balance" size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>Không có tranh chấp nào</Text>
      <Text style={styles.emptySubtitle}>
        Hiện chưa có tranh chấp nào trong danh mục này
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Icon name="file-document-outline" size={24} color={COLORS.primary} />
        <Text style={styles.statNumber}>{pagination.total || disputes.length}</Text>
        <Text style={styles.statLabel}>Tổng cộng</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="eye-check-outline" size={24} color="#8B5CF6" />
        <Text style={styles.statNumber}>
          {disputes.filter(d => d.status === 'under_review').length}
        </Text>
        <Text style={styles.statLabel}>Đang xem xét</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="pencil-plus-outline" size={24} color="#F97316" />
        <Text style={styles.statNumber}>
          {disputes.filter(d => d.status === 'under_review' && !hasInspectorEvidence(d)).length}
        </Text>
        <Text style={styles.statLabel}>Cần ý kiến</Text>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Tranh chấp</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Icon name="refresh" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải tranh chấp...</Text>
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm tranh chấp..."
              placeholderTextColor={COLORS.textLight}
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContainer}
          >
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  activeTab === tab.key && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Disputes List */}
          <FlatList
            data={filteredDisputes()}
            renderItem={renderDisputeCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={renderHeader}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
              />
            }
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 8,
    fontSize: 14,
    color: COLORS.dark,
  },
  tabScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingBottom: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
    paddingTop: 4,
  },
  disputeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardAccent: {
    height: 3,
    width: '100%',
  },
  cardBody: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 10,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  disputeId: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
  },
  descriptionText: {
    fontSize: 13,
    color: COLORS.secondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  evidenceCountText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  evidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  evidenceBadgeWarning: {},
  evidenceBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default DisputeResolutionScreen;
