import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
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

const InspectionDetailScreen = ({ navigation, route }) => {
  const { inspectionId, inspectionData, isCompleted } = route.params;
  const [loading, setLoading] = useState(!inspectionData); // Don't load if data is provided
  const [inspection, setInspection] = useState({
    id: 'INS-2024-015',
    bikeModel: 'Giant TCR Advanced Pro',
    bikeBrand: 'Giant',
    bikeCategory: 'Xe đạp đua',
    bikeYear: 2022,
    bikePrice: 45000000,
    bikeCondition: 'Đã qua sử dụng',
    bikeImages: [
      'https://via.placeholder.com/400',
      'https://via.placeholder.com/400',
      'https://via.placeholder.com/400',
    ],
    description: 'Xe đạp đua cao cấp, khung carbon, đầy đủ phụ kiện. Sử dụng ít, còn rất mới.',
    
    // Seller Info
    seller: {
      id: 'seller-demo-id',
      name: 'Nguyễn Văn B',
      phone: '0912345678',
      email: 'nguyenvanb@email.com',
      rating: 4.5,
      totalSales: 12,
    },
    
    // Request Info
    requestType: 'on-site',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    coordinates: { lat: 10.7756, lng: 106.7019 },
    requestDate: '2024-02-02T10:30:00',
    preferredDate: '2024-02-05T14:00:00',
    status: 'pending',
    
    // Inspection Details
    inspectionFee: 0, // First time is free
    isFirstInspection: true,
    lastInspectionDate: null,
    
    // Technical Specs to Check
    technicalSpecs: {
      frameSize: '54cm',
      frameMaterial: 'Carbon',
      weight: '7.5kg',
      wheelSize: '700c',
      brakeType: 'Phanh đĩa thủy lực',
      gearSystem: 'Shimano Ultegra Di2',
      suspension: 'Không',
    },
    
    // Notes from seller
    sellerNotes: 'Xe mới đi được 2000km, bảo dưỡng định kỳ. Có hóa đơn mua hàng và sách bảo hành.',
  });

  useEffect(() => { 
    const loadData = () => {
      if (inspectionData && isCompleted) {
        // Use provided data from my-inspections list
        transformInspectionData(inspectionData);
      } else {
        // Fetch detail from API for pending inspections
        fetchInspectionDetail();
      }
    };
    
    loadData();
    
    // Auto-refresh every 5 seconds
    const refreshInterval = setInterval(() => {
      loadData();
    }, 5000);
    
    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, [inspectionId, inspectionData]);

  const transformInspectionData = async (data) => {
    try {
      setLoading(true);
      let bike = data.bicycle || null;
      
      // If bicycle is not populated (only ID), fetch from API
      if (!bike && data.bicycleId && typeof data.bicycleId === 'string') {
        try {
          console.log(`📤 Fetching bicycle ${data.bicycleId} for inspection detail...`);
          const bicycleResponse = await BicycleAPI.getBicycleById(data.bicycleId);
          bike = bicycleResponse?.data || null;
          console.log('✅ Bicycle fetched for inspection detail:', bike?.title);
        } catch (error) {
          console.warn('⚠️ Could not fetch bicycle:', error.message);
        }
      }
      // Fetch seller info using sellerId
      const sellerId = bike?.sellerId || data.sellerId || null;
      let sellerInfo = null;
      if (sellerId) {
        try {
          const sellerResponse = await InspectorAPI.getUserById(sellerId);
          sellerInfo = sellerResponse?.data || sellerResponse || null;
        } catch (error) {
          console.warn('⚠️ Could not fetch seller:', error.message);
        }
      }

      // Transform my-inspections data to UI format
      setInspection({
        id: data._id || data.id,
        bikeModel: bike?.specifications?.model || bike?.title || 'N/A',
        bikeBrand: bike?.specifications?.brand || 'N/A',
        bikeCategory: bike?.specifications?.type || 'N/A',
        bikeYear: bike?.specifications?.year,
        bikePrice: bike?.price,
        bikeCondition: bike?.condition?.overall || 'N/A',
        bikeImages: bike?.media?.images || bike?.media?.photos || data.media?.photos || [],
        description: bike?.description || '',
        seller: {
          id: sellerId,
          name: sellerInfo ? `${sellerInfo.firstName || ''} ${sellerInfo.lastName || ''}`.trim() || 'N/A' : 'N/A',
          phone: sellerInfo?.phone || 'N/A',
          email: sellerInfo?.email || 'N/A',
          rating: sellerInfo?.reputation?.rating || 0,
          totalSales: sellerInfo?.reputation?.totalSales || 0,
        },
        requestType: data.inspectionType || 'onsite',
        address: bike?.location ? 
          `${bike.location.address || bike.location.street || ''}, ${bike.location.district || ''}, ${bike.location.city || ''}`.trim() 
          : 'N/A',
        coordinates: bike?.location?.coordinates || { lat: 0, lng: 0 },
        requestDate: data.createdAt,
        preferredDate: data.preferredDate,
        status: data.verdict || 'pending',
        inspectionFee: data.inspectionFee || 0,
        isFirstInspection: data.inspectionFee === 0,
        lastInspectionDate: null,
        technicalSpecs: bike?.specifications || {},
        sellerNotes: bike?.notes || '',
        // Inspection results
        technicalChecks: data.technicalChecks || null,
        overallRating: data.overallRating || null,
        recommendations: data.recommendations || '',
        verdict: data.verdict || 'pending',
        validUntil: data.validUntil || null,
      });
      // console.log('✅ Transformed inspection data:', inspection);
    } catch (error) {
      console.error('❌ Error transforming inspection data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInspectionDetail = async () => {
    try {
      setLoading(true);
      const response = await InspectorAPI.getInspectionDetail(inspectionId);
      
      if (response?.data) {
        const data = response.data;
        let bike = data.bicycle || null;
        
        // If bicycle is not populated (only ID), fetch from API
        if (!bike && data.bicycleId && typeof data.bicycleId === 'string') {
          try {
            console.log(`📤 Fetching bicycle ${data.bicycleId} for inspection detail...`);
            const bicycleResponse = await BicycleAPI.getBicycleById(data.bicycleId);
            bike = bicycleResponse?.data || null;
            console.log('✅ Bicycle fetched for inspection detail:', bike?.title);
          } catch (error) {
            console.warn('⚠️ Could not fetch bicycle:', error.message);
          }
        }
        
        // Fetch seller info using sellerId
        const sellerId = bike?.sellerId || data.sellerId || null;
        let sellerInfo = null;
        if (sellerId) {
          try {
            const sellerResponse = await InspectorAPI.getUserById(sellerId);
            sellerInfo = sellerResponse?.data || sellerResponse || null;
          } catch (error) {
            console.warn('⚠️ Could not fetch seller:', error.message);
          }
        }

        // Transform API data to match UI
        setInspection({
          id: data._id,
          bikeTitle: bike?.title || `Xe #${data.bicycleId?.slice(-6) || 'N/A'}`,
          bikeModel: bike?.specifications?.model || bike?.title || `Xe #${data.bicycleId?.slice(-6) || 'N/A'}`,
          bikeBrand: bike?.specifications?.brand || 'N/A',
          bikeCategory: bike?.specifications?.type || 'N/A',
          bikeYear: bike?.specifications?.year,
          bikePrice: bike?.price,
          bikeCondition: bike?.condition?.overall || 'N/A',
          bikeImages: bike?.media?.images || bike?.media?.photos || ['https://bizweb.dktcdn.net/100/412/747/products/xe-dap-dua-magicbros-s600-5.jpg?v=1731484215820'],
          description: bike?.description || '',
          seller: {
            id: sellerId,
            name: sellerInfo?.name || sellerInfo?.fullName || sellerInfo?.username || 'N/A',
            phone: sellerInfo?.phone || sellerInfo?.phoneNumber || 'N/A',
            email: sellerInfo?.email || 'N/A',
            rating: sellerInfo?.reputation?.rating || 0,
            totalSales: sellerInfo?.reputation?.totalSales || 0,
          },
          requestType: data.inspectionType || 'onsite',
          address: bike?.location ? 
            `${bike.location.address || bike.location.street || ''}, ${bike.location.district || ''}, ${bike.location.city || ''}`.trim() 
            : 'N/A',
          coordinates: bike?.location?.coordinates || { lat: 0, lng: 0 },
          requestDate: data.createdAt,
          preferredDate: data.preferredDate,
          status: data.verdict || 'pending',
          inspectionFee: data.inspectionFee || 0,
          isFirstInspection: data.inspectionFee === 0,
          lastInspectionDate: null,
          technicalSpecs: bike?.specifications || {},
          sellerNotes: bike?.notes || '',
          // Add inspection results if available
          technicalChecks: data.technicalChecks || null,
          overallRating: data.overallRating || null,
          recommendations: data.recommendations || '',
          verdict: data.verdict || 'pending',
          validUntil: data.validUntil || null,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching inspection detail:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết kiểm định. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    Linking.openURL(`tel:${inspection.seller.phone}`);
  };

  const handleMessage = () => {
    navigation.navigate('ChatDetail', {
      user: inspection?.seller?.name || 'Người bán',
      recipientId: inspection?.seller?.id,
    });
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps?q=${inspection.coordinates.lat},${inspection.coordinates.lng}`;
    Linking.openURL(url);
  };

  const handleAcceptRequest = () => {
    Alert.alert(
      'Chấp nhận yêu cầu',
      'Bạn có chắc chắn muốn chấp nhận yêu cầu kiểm định này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chấp nhận',
          onPress: () => {
            // TODO: API call to accept
            navigation.navigate('PerformInspection', { inspectionId: inspection.id });
          },
        },
      ]
    );
  };

  const handleRejectRequest = () => {
    Alert.alert(
      'Từ chối yêu cầu',
      'Vui lòng cho biết lý do từ chối:',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Bận lịch', onPress: () => console.log('Reject: Busy') },
        { text: 'Khu vực xa', onPress: () => console.log('Reject: Far') },
        { text: 'Lý do khác', onPress: () => console.log('Reject: Other') },
      ]
    );
  };

  const InfoRow = ({ icon, label, value, onPress }) => (
    <TouchableOpacity style={styles.infoRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.infoLeft}>
        <Icon name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
      {onPress && <Icon name="chevron-right" size={20} color={COLORS.gray} />}
    </TouchableOpacity>
  );

  const SpecRow = ({ label, value }) => (
    <View style={styles.specRow}>
      <Text style={styles.specLabel}>{label}:</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.container}>
      <ScrollView>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor(inspection.status) }]}>
          <Icon name="information" size={20} color={COLORS.white} />
          <Text style={styles.statusBannerText}>
            Trạng thái: {getStatusText(inspection.status)}
          </Text>
        </View>

        {/* Bike Images */}
        <View style={styles.imageContainer}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {(inspection.bikeImages || []).map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.bikeImage} />
            ))}
          </ScrollView>
          {inspection.isFirstInspection && (
            <View style={styles.freeBadge}>
              <Icon name="gift" size={16} color={COLORS.white} />
              <Text style={styles.freeBadgeText}>Miễn phí</Text>
            </View>
          )}
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.bikeModel}>{inspection.bikeTitle}</Text>
            <View style={styles.priceContainer}>
              <Icon name="cash" size={16} color={COLORS.primary} />
              <Text style={styles.bikePrice}>
                {(inspection.inspectionFee / 1000).toFixed(0) === '0' 
                  ? 'Miễn phí' 
                  : `${(inspection.inspectionFee / 1000).toFixed(0)}K`}
              </Text>
            </View>
          </View>
          <View style={styles.bikeInfo}>
            <Text style={styles.bikeBrand}>{inspection.bikeBrand}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.bikeCategory}>{inspection.bikeCategory}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.bikeYear}>{inspection.bikeYear}</Text>
          </View>
          <Text style={styles.description}>{inspection.description}</Text>
        </View>

        {/* Request Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin yêu cầu</Text>
          <InfoRow
            icon="identifier"
            label="Mã yêu cầu"
            value={inspection.id}
          />
          <InfoRow
            icon={inspection.requestType === 'on-site' ? 'map-marker' : 'laptop'}
            label="Loại kiểm định"
            value={inspection.requestType === 'on-site' ? 'Tại chỗ' : 'Trực tuyến'}
          />
          <InfoRow
            icon="calendar"
            label="Ngày yêu cầu"
            value={new Date(inspection.requestDate).toLocaleString('vi-VN')}
          />
          <InfoRow
            icon="calendar-check"
            label="Ngày mong muốn"
            value={new Date(inspection.preferredDate).toLocaleString('vi-VN')}
          />
          {inspection.requestType === 'on-site' && (
            <InfoRow
              icon="navigation"
              label="Địa chỉ"
              value={inspection.address}
              onPress={handleNavigate}
            />
          )}
        </View>

        {/* Seller Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người bán</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerHeader}>
              <View style={styles.avatar}>
                <Icon name="account" size={32} color={COLORS.primary} />
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{inspection.seller.name}</Text>
                <View style={styles.sellerPhoneRow}>
                  <Icon name="phone" size={13} color={COLORS.gray} />
                  <Text style={styles.sellerPhone}>{inspection.seller.phone}</Text>
                </View>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={14} color={COLORS.warning} />
                  <Text style={styles.rating}>{inspection.seller.rating}</Text>
                  <Text style={styles.totalSales}>({inspection.seller.totalSales} giao dịch)</Text>
                </View>
              </View>
            </View>
            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                <Icon name="phone" size={20} color={COLORS.primary} />
                <Text style={styles.contactBtnText}>Gọi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn} onPress={handleMessage}>
                <Icon name="message-text" size={20} color={COLORS.primary} />
                <Text style={styles.contactBtnText}>Nhắn tin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Technical Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông số kỹ thuật cần kiểm tra</Text>
          <View style={styles.specsCard}>
            {Object.entries(inspection.technicalSpecs || {}).map(([key, value]) => (
              <SpecRow
                key={key}
                label={getSpecLabel(key)}
                value={value}
              />
            ))}
          </View>
        </View>

        {/* Technical Checks Results - Only show if inspection is completed */}
        {inspection.technicalChecks && inspection.verdict !== 'pending' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderWithBadge}>
              <Text style={styles.sectionTitle}>Kết quả kiểm định</Text>
              <View style={[
                styles.verdictBadge,
                inspection.verdict === 'approved' && styles.approvedBadge,
                inspection.verdict === 'rejected' && styles.rejectedBadge,
                inspection.verdict === 'conditional' && styles.conditionalBadge,
              ]}>
                <Icon 
                  name={inspection.verdict === 'approved' ? 'check-circle' : inspection.verdict === 'rejected' ? 'close-circle' : 'alert-circle'} 
                  size={16} 
                  color={COLORS.white} 
                />
                <Text style={styles.verdictBadgeText}>
                  {inspection.verdict === 'approved' ? 'Phê duyệt' : inspection.verdict === 'rejected' ? 'Từ chối' : 'Có điều kiện'}
                </Text>
              </View>
            </View>

            {/* Overall Rating */}
            {inspection.overallRating && (
              <View style={styles.ratingCard}>
                <Text style={styles.ratingLabel}>Đánh giá tổng thể</Text>
                <View style={styles.ratingStars}>
                  {[...Array(10)].map((_, i) => (
                    <Icon 
                      key={i}
                      name={i < inspection.overallRating ? 'star' : 'star-outline'}
                      size={20}
                      color={i < inspection.overallRating ? COLORS.warning : COLORS.gray}
                    />
                  ))}
                  <Text style={styles.ratingValue}>{inspection.overallRating}/10</Text>
                </View>
              </View>
            )}

            {/* Frame Check */}
            {inspection.technicalChecks.frame && (
              <View style={styles.checkCard}>
                <View style={styles.checkHeader}>
                  <Icon name="bike-fast" size={24} color={COLORS.primary} />
                  <Text style={styles.checkTitle}>Khung xe</Text>
                  <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(inspection.technicalChecks.frame.condition) + '20' }]}>
                    <Text style={[styles.conditionText, { color: getConditionColor(inspection.technicalChecks.frame.condition) }]}>
                      {getConditionLabel(inspection.technicalChecks.frame.condition)}
                    </Text>
                  </View>
                </View>
                {inspection.technicalChecks.frame.issues && inspection.technicalChecks.frame.issues.length > 0 && (
                  <View style={styles.issuesContainer}>
                    <Text style={styles.issuesLabel}>Vấn đề phát hiện:</Text>
                    {inspection.technicalChecks.frame.issues.map((issue, index) => (
                      <View key={index} style={styles.issueItem}>
                        <Icon name="alert-circle-outline" size={16} color={COLORS.warning} />
                        <Text style={styles.issueText}>{issue}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {inspection.technicalChecks.frame.notes && (
                  <Text style={styles.checkNotes}>{inspection.technicalChecks.frame.notes}</Text>
                )}
              </View>
            )}

            {/* Brakes Check */}
            {inspection.technicalChecks.brakes && (
              <View style={styles.checkCard}>
                <View style={styles.checkHeader}>
                  <Icon name="car-brake-alert" size={24} color={COLORS.primary} />
                  <Text style={styles.checkTitle}>Hệ thống phanh</Text>
                  <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(inspection.technicalChecks.brakes.condition) + '20' }]}>
                    <Text style={[styles.conditionText, { color: getConditionColor(inspection.technicalChecks.brakes.condition) }]}>
                      {getConditionLabel(inspection.technicalChecks.brakes.condition)}
                    </Text>
                  </View>
                </View>
                {inspection.technicalChecks.brakes.issues && inspection.technicalChecks.brakes.issues.length > 0 && (
                  <View style={styles.issuesContainer}>
                    <Text style={styles.issuesLabel}>Vấn đề phát hiện:</Text>
                    {inspection.technicalChecks.brakes.issues.map((issue, index) => (
                      <View key={index} style={styles.issueItem}>
                        <Icon name="alert-circle-outline" size={16} color={COLORS.warning} />
                        <Text style={styles.issueText}>{issue}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {inspection.technicalChecks.brakes.notes && (
                  <Text style={styles.checkNotes}>{inspection.technicalChecks.brakes.notes}</Text>
                )}
              </View>
            )}

            {/* Drivetrain Check */}
            {inspection.technicalChecks.drivetrain && (
              <View style={styles.checkCard}>
                <View style={styles.checkHeader}>
                  <Icon name="cog" size={24} color={COLORS.primary} />
                  <Text style={styles.checkTitle}>Bộ truyền động</Text>
                  <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(inspection.technicalChecks.drivetrain.condition) + '20' }]}>
                    <Text style={[styles.conditionText, { color: getConditionColor(inspection.technicalChecks.drivetrain.condition) }]}>
                      {getConditionLabel(inspection.technicalChecks.drivetrain.condition)}
                    </Text>
                  </View>
                </View>
                {inspection.technicalChecks.drivetrain.issues && inspection.technicalChecks.drivetrain.issues.length > 0 && (
                  <View style={styles.issuesContainer}>
                    <Text style={styles.issuesLabel}>Vấn đề phát hiện:</Text>
                    {inspection.technicalChecks.drivetrain.issues.map((issue, index) => (
                      <View key={index} style={styles.issueItem}>
                        <Icon name="alert-circle-outline" size={16} color={COLORS.warning} />
                        <Text style={styles.issueText}>{issue}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {inspection.technicalChecks.drivetrain.notes && (
                  <Text style={styles.checkNotes}>{inspection.technicalChecks.drivetrain.notes}</Text>
                )}
              </View>
            )}

            {/* Wheels Check */}
            {inspection.technicalChecks.wheels && (
              <View style={styles.checkCard}>
                <View style={styles.checkHeader}>
                  <Icon name="tire" size={24} color={COLORS.primary} />
                  <Text style={styles.checkTitle}>Bánh xe</Text>
                  <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(inspection.technicalChecks.wheels.condition) + '20' }]}>
                    <Text style={[styles.conditionText, { color: getConditionColor(inspection.technicalChecks.wheels.condition) }]}>
                      {getConditionLabel(inspection.technicalChecks.wheels.condition)}
                    </Text>
                  </View>
                </View>
                {inspection.technicalChecks.wheels.issues && inspection.technicalChecks.wheels.issues.length > 0 && (
                  <View style={styles.issuesContainer}>
                    <Text style={styles.issuesLabel}>Vấn đề phát hiện:</Text>
                    {inspection.technicalChecks.wheels.issues.map((issue, index) => (
                      <View key={index} style={styles.issueItem}>
                        <Icon name="alert-circle-outline" size={16} color={COLORS.warning} />
                        <Text style={styles.issueText}>{issue}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {inspection.technicalChecks.wheels.notes && (
                  <Text style={styles.checkNotes}>{inspection.technicalChecks.wheels.notes}</Text>
                )}
              </View>
            )}

            {/* Recommendations */}
            {inspection.recommendations && inspection.recommendations !== 'No recommendations' && (
              <View style={styles.recommendationsCard}>
                <View style={styles.recommendationsHeader}>
                  <Icon name="lightbulb-on" size={20} color={COLORS.primary} />
                  <Text style={styles.recommendationsTitle}>Khuyến nghị</Text>
                </View>
                <Text style={styles.recommendationsText}>{inspection.recommendations}</Text>
              </View>
            )}

            {/* Valid Until */}
            {inspection.validUntil && (
              <View style={styles.validityCard}>
                <Icon name="calendar-check" size={20} color={COLORS.success} />
                <Text style={styles.validityText}>
                  Giấy chứng nhận có hiệu lực đến: {new Date(inspection.validUntil).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Seller Notes */}
        {inspection.sellerNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú từ người bán</Text>
            <View style={styles.notesCard}>
              <Icon name="note-text" size={20} color={COLORS.gray} />
              <Text style={styles.notesText}>{inspection.sellerNotes}</Text>
            </View>
          </View>
        )}

        {/* Inspection History */}
        {inspection.lastInspectionDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch sử kiểm định</Text>
            <View style={styles.historyCard}>
              <Icon name="history" size={20} color={COLORS.info} />
              <Text style={styles.historyText}>
                Lần kiểm định gần nhất: {new Date(inspection.lastInspectionDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {inspection.status === 'pending' && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.rejectButton} onPress={handleRejectRequest}>
            <Icon name="close" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptRequest}>
            <Icon name="check" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>Chấp nhận</Text>
          </TouchableOpacity>
        </View>
      )}

      {inspection.status === 'in-progress' && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.fullButton}
            onPress={() => navigation.navigate('PerformInspection', { inspectionId: inspection.id })}
          >
            <Text style={styles.buttonText}>Tiếp tục kiểm định</Text>
            <Icon name="arrow-right" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}
      </View>
    </SafeAreaView>
  );
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

const getSpecLabel = (key) => {
  const labels = {
    frameSize: 'Kích thước khung',
    frameMaterial: 'Chất liệu khung',
    weight: 'Trọng lượng',
    wheelSize: 'Kích thước bánh',
    brakeType: 'Loại phanh',
    gearSystem: 'Hệ thống số',
    suspension: 'Giảm xóc',
  };
  return labels[key] || key;
};

const getConditionColor = (condition) => {
  const colors = {
    excellent: COLORS.success,
    good: '#2196F3',
    fair: COLORS.warning,
    poor: COLORS.error,
  };
  return colors[condition] || COLORS.secondary;
};

const getConditionLabel = (condition) => {
  const labels = {
    excellent: 'Xuất sắc',
    good: 'Tốt',
    fair: 'Khá',
    poor: 'Kém',
  };
  return labels[condition] || condition;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
  },
  statusBannerText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageContainer: {
    height: 280,
    backgroundColor: COLORS.dark,
  },
  bikeImage: {
    width: 400,
    height: 280,
    resizeMode: 'cover',
  },
  freeBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  freeBadgeText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginTop: 10,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bikeModel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
    flex: 1,
    lineHeight: 28,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bikePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bikeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  bikeBrand: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  separator: {
    marginHorizontal: 8,
    color: '#CCC',
  },
  bikeCategory: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  bikeYear: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: COLORS.dark,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 10,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginRight: 8,
  },
  sellerCard: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#FAFAFA',
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  sellerName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  sellerPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
    marginBottom: 2,
  },
  sellerPhone: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginLeft: 4,
  },
  totalSales: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 6,
    fontWeight: '500',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    gap: 6,
    backgroundColor: COLORS.white,
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  specsCard: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#FAFAFA',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  specLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  specValue: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '600',
  },
  notesCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: 14,
    padding: 18,
    gap: 14,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark,
    lineHeight: 22,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '15',
    borderRadius: 14,
    padding: 18,
    gap: 14,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark,
    lineHeight: 22,
  },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  fullButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // New styles for technical checks display
  sectionHeaderWithBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  verdictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  approvedBadge: {
    backgroundColor: COLORS.success,
  },
  rejectedBadge: {
    backgroundColor: COLORS.error,
  },
  conditionalBadge: {
    backgroundColor: COLORS.warning,
  },
  verdictBadgeText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  ratingCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
  },
  checkCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  checkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  checkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  conditionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  issuesContainer: {
    marginTop: 8,
  },
  issuesLabel: {
    fontSize: 13,
    color: COLORS.secondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    paddingVertical: 2,
  },
  issueText: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
  },
  checkNotes: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  recommendationsCard: {
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recommendationsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  recommendationsText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  validityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  validityText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '600',
    flex: 1,
  },
});

export default InspectionDetailScreen;
