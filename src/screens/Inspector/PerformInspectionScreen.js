import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import InspectorAPI from '../../services/inspector.api';
import { BicycleAPI } from '../../services/api';

const PerformInspectionScreen = ({ navigation, route }) => {
  const { inspectionId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [inspectionData, setInspectionData] = useState({
    // Basic Info
    bikeModel: 'Giant TCR Advanced Pro',
    inspectionId: inspectionId || 'INS-2024-015',
    
    // Frame Inspection
    frameCondition: '',
    frameIssues: [],
    frameNotes: '',
    frameImages: [],
    
    // Brake System
    brakeCondition: '',
    brakeIssues: [],
    brakeNotes: '',
    brakeImages: [],
    
    // Drivetrain
    drivetrainCondition: '',
    drivetrainIssues: [],
    drivetrainNotes: '',
    drivetrainImages: [],
    
    // Wheels & Tires
    wheelsCondition: '',
    wheelsIssues: [],
    wheelsNotes: '',
    wheelsImages: [],
    
    // Other Components
    handlebarCondition: '',
    saddleCondition: '',
    pedalCondition: '',
    
    // Overall Assessment
    overallCondition: '',
    // estimatedValue: '',
    recommendationForBuyer: '',
    certificationValid: true,
    certificationExpiry: '',
    
    // Inspector Notes
    inspectorNotes: '',
    inspectionImages: [],
  });

  const [currentSection, setCurrentSection] = useState('frame');

  useEffect(() => {
    if (inspectionId) {
      fetchInspectionData();
    }
  }, [inspectionId]);

  const fetchInspectionData = async () => {
    try {
      setLoading(true);      
      const response = await InspectorAPI.getInspectionDetail(inspectionId);
      
      if (response?.data) {
        const inspection = response.data;
        let bicycle = null;
        
        // Fetch bicycle details if bicycleId exists
        if (inspection.bicycleId && typeof inspection.bicycleId === 'string') {
          try {
            const bicycleResponse = await BicycleAPI.getBicycleById(inspection.bicycleId);
            bicycle = bicycleResponse?.data || null;
          } catch (error) {
            console.warn('⚠️ Could not fetch bicycle:', error.message);
          }
        }
        
        // Update inspection data with real data
        setInspectionData(prev => ({
          ...prev,
          bikeModel: bicycle?.specifications?.model || bicycle?.title || `Xe #${inspection.bicycleId?.slice(-6) || 'N/A'}`,
          inspectionId: inspection._id || inspectionId,
        }));
      }
    } catch (error) {
      console.error('❌ Error fetching inspection data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin kiểm định. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const conditionOptions = [
    { value: 'excellent', label: 'Xuất sắc', icon: 'star', color: COLORS.success },
    { value: 'good', label: 'Tốt', icon: 'thumb-up', color: COLORS.info },
    { value: 'fair', label: 'Khá', icon: 'minus-circle', color: COLORS.warning },
    { value: 'poor', label: 'Kém', icon: 'alert', color: COLORS.error },
  ];

  const frameIssuesOptions = [
    'Vết trầy xước nhẹ',
    'Vết trầy xước sâu',
    'Nứt khung',
    'Biến dạng khung',
    'Gỉ sét',
    'Sơn bong tróc',
    'Không có vấn đề',
  ];

  const brakeIssuesOptions = [
    'Má phanh mòn',
    'Dầu phanh cần thay',
    'Phanh kém hiệu quả',
    'Đĩa phanh cong vênh',
    'Ống dẫn rò rỉ',
    'Không có vấn đề',
  ];

  const drivetrainIssuesOptions = [
    'Xích mòn',
    'Líp mòn',
    'Đùm răng mòn',
    'Sang số không mượt',
    'Tiếng kêu bất thường',
    'Cần bảo dưỡng',
    'Không có vấn đề',
  ];

  const wheelsIssuesOptions = [
    'Lốp mòn',
    'Vành cong',
    'Nan hỏng',
    'Moay-ơ cần bảo dưỡng',
    'Áp suất không đủ',
    'Không có vấn đề',
  ];

  const handleImagePicker = async (section) => {
    Alert.alert(
      'Chọn ảnh',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Máy ảnh',
          onPress: async () => {
            // Request camera permission
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Lỗi', 'Cần cấp quyền sử dụng camera');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8,
              allowsEditing: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              addImage(section, result.assets[0].uri);
            }
          },
        },
        {
          text: 'Thư viện',
          onPress: async () => {
            // Request media library permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8,
              allowsEditing: false,
              allowsMultipleSelection: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              addImage(section, result.assets[0].uri);
            }
          },
        },
      ]
    );
  };

  const addImage = (section, uri) => {
    setInspectionData((prev) => ({
      ...prev,
      [`${section}Images`]: [...prev[`${section}Images`], uri],
    }));
  };

  const removeImage = (section, index) => {
    setInspectionData((prev) => ({
      ...prev,
      [`${section}Images`]: prev[`${section}Images`].filter((_, i) => i !== index),
    }));
  };

  const toggleIssue = (section, issue) => {
    const key = `${section}Issues`;
    setInspectionData((prev) => ({
      ...prev,
      [key]: prev[key].includes(issue)
        ? prev[key].filter((i) => i !== issue)
        : [...prev[key], issue],
    }));
  };

  const handleSubmitInspection = async () => {
    // Validate required fields
    if (!inspectionData.frameCondition || !inspectionData.brakeCondition ||
        !inspectionData.drivetrainCondition || !inspectionData.wheelsCondition) {
      Alert.alert('Thiếu thông tin', 'Vui lòng đánh giá đầy đủ các bộ phận chính.');
      return;
    }

    if (!inspectionData.overallCondition) {
      Alert.alert('Thiếu thông tin', 'Vui lòng đánh giá tổng quan xe.');
      return;
    }

    Alert.alert(
      'Xác nhận gửi báo cáo',
      'Bạn có chắc chắn muốn gửi báo cáo kiểm định này? Báo cáo sẽ được gắn vào tin đăng và có giá trị trong 30 ngày.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi báo cáo',
          onPress: async () => {
            try {
              setSubmitting(true);
              
              // Upload all images first
              console.log('📤 Uploading images...');
              const uploadPromises = [];
              
              if (inspectionData.frameImages.length > 0) {
                uploadPromises.push(InspectorAPI.uploadMultipleMedia(inspectionData.frameImages));
              }
              if (inspectionData.brakeImages.length > 0) {
                uploadPromises.push(InspectorAPI.uploadMultipleMedia(inspectionData.brakeImages));
              }
              if (inspectionData.drivetrainImages.length > 0) {
                uploadPromises.push(InspectorAPI.uploadMultipleMedia(inspectionData.drivetrainImages));
              }
              if (inspectionData.wheelsImages.length > 0) {
                uploadPromises.push(InspectorAPI.uploadMultipleMedia(inspectionData.wheelsImages));
              }
              if (inspectionData.inspectionImages.length > 0) {
                uploadPromises.push(InspectorAPI.uploadMultipleMedia(inspectionData.inspectionImages));
              }
              
              const uploadedUrls = await Promise.all(uploadPromises);
              const allPhotos = uploadedUrls.flat();
              
              console.log('✅ Images uploaded:', allPhotos.length);
              
              // Determine verdict based on overall condition
              let verdict = 'rejected';
              if (inspectionData.overallCondition === 'excellent' || inspectionData.overallCondition === 'good') {
                verdict = 'approved';
              } else if (inspectionData.overallCondition === 'fair') {
                verdict = 'approved_with_conditions';
              }
              
              // Calculate overall rating (1-10) from condition
              const ratingMap = {
                'excellent': 10,
                'good': 8,
                'fair': 6,
                'poor': 3,
              };
              const overallRating = ratingMap[inspectionData.overallCondition] || 5;
              
              // Prepare inspection data for API
              const apiData = {
                technicalChecks: {
                  frame: {
                    condition: inspectionData.frameCondition,
                    issues: inspectionData.frameIssues,
                    notes: inspectionData.frameNotes,
                  },
                  brakes: {
                    condition: inspectionData.brakeCondition,
                    issues: inspectionData.brakeIssues,
                    notes: inspectionData.brakeNotes,
                  },
                  drivetrain: {
                    condition: inspectionData.drivetrainCondition,
                    issues: inspectionData.drivetrainIssues,
                    notes: inspectionData.drivetrainNotes,
                  },
                  wheels: {
                    condition: inspectionData.wheelsCondition,
                    issues: inspectionData.wheelsIssues,
                    notes: inspectionData.wheelsNotes,
                  },
                  suspension: {
                    condition: 'n/a',
                    issues: [],
                    notes: '',
                  },
                },
                overallRating: overallRating,
                verdict: verdict,
                recommendations: inspectionData.recommendationForBuyer || inspectionData.inspectorNotes || 'No recommendations',
                media: {
                  photos: allPhotos,
                  videos: [],
                },
              };
              
              console.log('📤 Submitting inspection report...');
              const response = await InspectorAPI.completeInspection(inspectionId, apiData);
              
              console.log('✅ Inspection completed:', response);
              Alert.alert(
                'Thành công', 
                'Báo cáo kiểm định đã được gửi thành công!', 
                [{ text: 'OK', onPress: () => navigation.navigate('InspectorMain', { screen: 'Dashboard' }) }]
              );
            } catch (error) {
              console.error('❌ Submit inspection error:', error);
              Alert.alert('Lỗi', error.message || 'Không thể gửi báo cáo. Vui lòng thử lại.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const ConditionSelector = ({ section, label }) => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.conditionOptions}>
        {conditionOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.conditionOption,
              inspectionData[`${section}Condition`] === option.value && {
                backgroundColor: option.color + '20',
                borderColor: option.color,
              },
            ]}
            onPress={() =>
              setInspectionData((prev) => ({ ...prev, [`${section}Condition`]: option.value }))
            }
          >
            <Icon
              name={option.icon}
              size={24}
              color={
                inspectionData[`${section}Condition`] === option.value ? option.color : COLORS.secondary
              }
            />
            <Text
              style={[
                styles.conditionOptionText,
                inspectionData[`${section}Condition`] === option.value && { color: option.color },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const IssuesSelector = ({ section, options }) => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionLabel}>Vấn đề phát hiện</Text>
      <View style={styles.issuesContainer}>
        {options.map((issue) => (
          <TouchableOpacity
            key={issue}
            style={[
              styles.issueChip,
              inspectionData[`${section}Issues`].includes(issue) && styles.issueChipActive,
            ]}
            onPress={() => toggleIssue(section, issue)}
          >
            <Text
              style={[
                styles.issueChipText,
                inspectionData[`${section}Issues`].includes(issue) && styles.issueChipTextActive,
              ]}
            >
              {issue}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const ImageSection = ({ section, label }) => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
        {(inspectionData[`${section}Images`] || []).map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.inspectionImage} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => removeImage(section, index)}
            >
              <Icon name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={styles.addImageBtn}
          onPress={() => handleImagePicker(section)}
        >
          <Icon name="camera-plus" size={32} color={COLORS.primary} />
          <Text style={styles.addImageText}>Thêm ảnh</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const NotesInput = ({ section, label, placeholder }) => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <TextInput
        style={styles.notesInput}
        placeholder={placeholder}
        multiline
        numberOfLines={4}
        value={inspectionData[`${section}Notes`]}
        onChangeText={(text) =>
          setInspectionData((prev) => ({ ...prev, [`${section}Notes`]: text }))
        }
      />
    </View>
  );

  const renderFrameSection = () => (
    <View>
      <ConditionSelector section="frame" label="Tình trạng khung xe" />
      <IssuesSelector section="frame" options={frameIssuesOptions} />
      <ImageSection section="frame" label="Hình ảnh khung xe" />
      <NotesInput
        section="frame"
        label="Ghi chú về khung"
        placeholder="Nhập ghi chú chi tiết về tình trạng khung xe..."
      />
    </View>
  );

  const renderBrakeSection = () => (
    <View>
      <ConditionSelector section="brake" label="Tình trạng phanh" />
      <IssuesSelector section="brake" options={brakeIssuesOptions} />
      <ImageSection section="brake" label="Hình ảnh hệ thống phanh" />
      <NotesInput
        section="brake"
        label="Ghi chú về phanh"
        placeholder="Nhập ghi chú chi tiết về hệ thống phanh..."
      />
    </View>
  );

  const renderDrivetrainSection = () => (
    <View>
      <ConditionSelector section="drivetrain" label="Tình trạng bộ truyền động" />
      <IssuesSelector section="drivetrain" options={drivetrainIssuesOptions} />
      <ImageSection section="drivetrain" label="Hình ảnh bộ truyền động" />
      <NotesInput
        section="drivetrain"
        label="Ghi chú về bộ truyền động"
        placeholder="Nhập ghi chú chi tiết về bộ truyền động..."
      />
    </View>
  );

  const renderWheelsSection = () => (
    <View>
      <ConditionSelector section="wheels" label="Tình trạng bánh xe & lốp" />
      <IssuesSelector section="wheels" options={wheelsIssuesOptions} />
      <ImageSection section="wheels" label="Hình ảnh bánh xe" />
      <NotesInput
        section="wheels"
        label="Ghi chú về bánh xe"
        placeholder="Nhập ghi chú chi tiết về bánh xe và lốp..."
      />
    </View>
  );

  const renderOverallSection = () => (
    <View>
      <ConditionSelector section="overall" label="Đánh giá tổng quan" />
      
      {/* <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Giá trị ước tính (VNĐ)</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: 35000000"
          keyboardType="numeric"
          value={inspectionData.estimatedValue}
          onChangeText={(text) =>
            setInspectionData((prev) => ({ ...prev, estimatedValue: text }))
          }
        />
      </View> */}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Khuyến nghị cho người mua</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Nhập khuyến nghị cho người mua..."
          multiline
          numberOfLines={4}
          value={inspectionData.recommendationForBuyer}
          onChangeText={(text) =>
            setInspectionData((prev) => ({ ...prev, recommendationForBuyer: text }))
          }
        />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Ghi chú tổng quan</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Nhập ghi chú tổng quan về xe..."
          multiline
          numberOfLines={6}
          value={inspectionData.inspectorNotes}
          onChangeText={(text) =>
            setInspectionData((prev) => ({ ...prev, inspectorNotes: text }))
          }
        />
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.certificationRow}>
          <View style={styles.certificationInfo}>
            <Icon name="certificate" size={24} color={COLORS.primary} />
            <View style={styles.certificationText}>
              <Text style={styles.certificationLabel}>Cấp nhãn kiểm định</Text>
              <Text style={styles.certificationSubtext}>Có hiệu lực 30 ngày</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.certificationToggle,
              inspectionData.certificationValid && styles.certificationToggleActive,
            ]}
            onPress={() =>
              setInspectionData((prev) => ({
                ...prev,
                certificationValid: !prev.certificationValid,
              }))
            }
          >
            <Icon
              name={inspectionData.certificationValid ? 'check' : 'close'}
              size={20}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ImageSection section="inspection" label="Hình ảnh tổng quan" />
    </View>
  );

  const sections = [
    { key: 'frame', label: 'Khung xe', icon: 'bike' },
    { key: 'brake', label: 'Phanh', icon: 'car-brake-alert' },
    { key: 'drivetrain', label: 'Truyền động', icon: 'cog' },
    { key: 'wheels', label: 'Bánh xe', icon: 'tire' },
    { key: 'overall', label: 'Tổng quan', icon: 'clipboard-check' },
  ];

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kiểm định xe</Text>
        <Text style={styles.headerSubtitle}>{inspectionData.bikeModel}</Text>
        <Text style={styles.inspectionId}>ID: {inspectionData.inspectionId}</Text>
      </View>

      {/* Section Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.key}
            style={[styles.tab, currentSection === section.key && styles.activeTab]}
            onPress={() => setCurrentSection(section.key)}
          >
            <Icon
              name={section.icon}
              size={16}
              color={currentSection === section.key ? COLORS.primary : COLORS.secondary}
            />
            <Text
              style={[styles.tabText, currentSection === section.key && styles.activeTabText]}
            >
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content}>
        {currentSection === 'frame' && renderFrameSection()}
        {currentSection === 'brake' && renderBrakeSection()}
        {currentSection === 'drivetrain' && renderDrivetrainSection()}
        {currentSection === 'wheels' && renderWheelsSection()}
        {currentSection === 'overall' && renderOverallSection()}
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitInspection}>
          <Icon name="send" size={20} color={COLORS.white} />
          <Text style={styles.submitButtonText}>Gửi báo cáo kiểm định</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    marginTop: 6,
    fontWeight: '500',
  },
  inspectionId: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 6,
    fontWeight: '600',
  },
  tabsContainer: {
    backgroundColor: COLORS.white,
    marginTop: 8,
    flexGrow: 0,
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
  },
  conditionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  conditionOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
  },
  conditionOptionText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 6,
    fontWeight: '600',
  },
  issuesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  issueChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    backgroundColor: COLORS.white,
  },
  issueChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  issueChipText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  issueChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  imagesScroll: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 14,
    position: 'relative',
  },
  inspectionImage: {
    width: 130,
    height: 130,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addImageBtn: {
    width: 130,
    height: 130,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '08',
  },
  addImageText: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 6,
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 120,
    backgroundColor: '#FAFAFA',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  certificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  certificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  certificationText: {
    marginLeft: 14,
    flex: 1,
  },
  certificationLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
  },
  certificationSubtext: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    fontWeight: '500',
  },
  certificationToggle: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certificationToggleActive: {
    backgroundColor: COLORS.success,
  },
  actionBar: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default PerformInspectionScreen;
