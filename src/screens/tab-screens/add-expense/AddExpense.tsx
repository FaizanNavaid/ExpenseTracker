import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  AddExpenseErrorModel,
  AddExpenseModel,
  CategoryModel,
} from '../../../services/interface';
import { useTheme } from '../../../services/utils/theme/useTheme';
import { AddExpenseValidationErrors } from '../../../models/validations/ExpenseValidationErrors';
import {
  formatDateISO,
  isValidAmount,
  requestCameraPermission,
  requestGalleryPermission,
} from '../../../services/helper/helper';
import ApiService from '../../../services/api/HttpHelper';
import { ENDPOINT } from '../../../services/api/EndPoint';
import { SCREENS } from '../../../config/navigation/screen-names/ScreenName';
import { parseApiError } from '../../../services/utils/errors/errorHandler';
import InputField from '../../../components/input-field';
import CustomHeader from '../../../components/custom-header';
import AppIcon from '../../../assets/icon';
import { AppIcons } from '../../../services/helper/iconName';
import AppButton from '../../../components/buttons';
import AppStatusBar from '../../../components/app-status-bar';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;

const TODAY_ISO = formatDateISO(new Date());
const YESTERDAY_ISO = formatDateISO(new Date(Date.now() - 24 * 60 * 60 * 1000));

const EMPTY_MODEL: AddExpenseModel = {
  title: '',
  amount: '',
  category_id: '',
  expense_date: TODAY_ISO,
  note: '',
  receipt_image: null,
};

export default function AddExpense() {
  const [model, setModel] = useState<AddExpenseModel>(EMPTY_MODEL);
  const [error, setError] = useState<AddExpenseErrorModel>({});
  const [isLoading, setIsLoading] = useState(false);

  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [showIosDatePicker, setShowIosDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const netInfo = useNetInfo();
  const navigation = useNavigation<any>();

  const selectedCategory = categories.find((c) => c._id === model.category_id);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const res = await ApiService.getFromAPI(ENDPOINT.category.list);
      console.log(res);
      
      const rawList = res?.data ?? res?.categories ?? (Array.isArray(res) ? res : []);
      const list: CategoryModel[] = Array.isArray(rawList)
        ? rawList
            .map((c: any) => ({
              _id: String(c?._id ?? c?.id ?? c?.categoryId ?? ''),
              name: String(c?.name ?? c?.title ?? ''),
              icon: c?.icon,
              color: c?.color,
            }))
            .filter((c: CategoryModel) => c._id && c.name)
        : [];
      setCategories(list);
    } catch (err: any) {
      setCategoriesError(parseApiError(err, 'addExpense'));
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const updateField = <K extends keyof AddExpenseModel>(
    key: K,
    value: AddExpenseModel[K],
  ) => {
    setModel((prev) => ({ ...prev, [key]: value }));
    if (error[key as keyof AddExpenseErrorModel]) {
      setError((prev) => {
        const updated = { ...prev };
        delete updated[key as keyof AddExpenseErrorModel];
        return updated;
      });
    }
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const sanitized =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
    updateField('amount', sanitized);
  };

  const validate = (): boolean => {
    const err: AddExpenseErrorModel = {};

    if (!model.title.trim()) {
      err.title = AddExpenseValidationErrors.titleRequired();
    }

    if (!model.amount.trim()) {
      err.amount = AddExpenseValidationErrors.amountRequired();
    } else if (!isValidAmount(model.amount)) {
      err.amount = AddExpenseValidationErrors.amountInvalid();
    }

    if (!model.category_id) {
      err.category_id = AddExpenseValidationErrors.categoryRequired();
    }

    if (!model.expense_date) {
      err.expense_date = AddExpenseValidationErrors.dateRequired();
    }

    setError(err);
    return Object.keys(err).length === 0;
  };

  // ============================
  // Date picker
  // ============================
  const openDatePicker = () => {
    const currentValue = model.expense_date
      ? new Date(model.expense_date)
      : new Date();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: currentValue,
        mode: 'date',
        maximumDate: new Date(),
        onValueChange: (_event, date) => {
          if (date) updateField('expense_date', formatDateISO(date));
        },
      });
    } else {
      setTempDate(currentValue);
      setShowIosDatePicker(true);
    }
  };

  const confirmIosDate = () => {
    updateField('expense_date', formatDateISO(tempDate));
    setShowIosDatePicker(false);
  };

  const dateDisplayLabel = (() => {
    if (!model.expense_date) return t('addExpense.selectDate');
    if (model.expense_date === TODAY_ISO) return t('addExpense.today');
    if (model.expense_date === YESTERDAY_ISO) return t('addExpense.yesterday');
    try {
      const [year, month, day] = model.expense_date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat(i18n.language === 'ur' ? 'ur' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(dateObj);
    } catch {
      return model.expense_date;
    }
  })();

  // ============================
  // Receipt image
  // ============================
  const pickFromCamera = async () => {
    const granted = await requestCameraPermission();
    if (!granted) return;

    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 1280,
      maxHeight: 1280,
      saveToPhotos: false,
    });

    if (result.didCancel || result.errorCode) return;
    const uri = result.assets?.[0]?.uri;
    if (uri) updateField('receipt_image', uri);
  };

  const pickFromGallery = async () => {
    const granted = await requestGalleryPermission();
    if (!granted) return;

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 1280,
      maxHeight: 1280,
      selectionLimit: 1,
    });

    if (result.didCancel || result.errorCode) return;
    const uri = result.assets?.[0]?.uri;
    if (uri) updateField('receipt_image', uri);
  };

  const handlePickReceipt = () => {
    Alert.alert(t('addExpense.chooseReceiptSource'), undefined, [
      { text: t('addExpense.useCamera'), onPress: pickFromCamera },
      { text: t('addExpense.useGallery'), onPress: pickFromGallery },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  // ============================
  // Submit
  // ============================
  const handleSubmit = async () => {
    if (!netInfo.isConnected) {
      Toast.show({ type: 'error', text1: t('errors.noInternet') });
      return;
    }

    if (!validate()) return;

    try {
      setIsLoading(true);

      let res: any;

      if (model.receipt_image) {
        const formData = new FormData();
        formData.append('title', model.title.trim());
        formData.append('amount', model.amount);
        formData.append('category_id', model.category_id);
        formData.append('expense_date', model.expense_date);
        if (model.note.trim()) formData.append('note', model.note.trim());
        formData.append('receipt_image', {
          uri: model.receipt_image,
          name: `receipt_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);

        res = await ApiService.postFromAPI(
          ENDPOINT.expense.addExpense,
          formData,
          '',
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
      } else {
        res = await ApiService.postFromAPI(ENDPOINT.expense.addExpense, {
          title: model.title.trim(),
          amount: model.amount,
          category_id: model.category_id,
          expense_date: model.expense_date,
          note: model.note.trim(),
        });
      }

      if (
        res?.status === 200 ||
        res?.status === 201 ||
        res?.status === 'success' ||
        res?.success === true ||
        res?.data
      ) {
        Toast.show({ type: 'success', text1: t('addExpense.expenseAdded') });
        setModel(EMPTY_MODEL);
        navigation.navigate(SCREENS.HOME);
      }
    } catch (err: any) {
      const friendlyMessage = parseApiError(err, 'addExpense');
      Toast.show({ type: 'error', text1: friendlyMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <CustomHeader
        title={t('addExpense.title')}
        leftIcon={
          <AppIcon name={AppIcons.menu} size={22} color={theme.textPrimary} />
        }
        onLeftIconPress={() => navigation.openDrawer?.()}
      />
      <AppStatusBar />

      <KeyboardAwareScrollView
        bottomOffset={20}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t('addExpense.subtitle')}</Text>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <InputField
              label={t('addExpense.titleLabel')}
              placeholder={t('addExpense.titlePlaceholder')}
              value={model.title}
              onChangeText={(text) => updateField('title', text)}
              hasError={!!error.title}
              leftIcon={
                <AppIcon
                  name={AppIcons.expenseTitle}
                  size={18}
                  color={theme.textTertiary}
                />
              }
            />
            {error.title ? (
              <Text style={styles.errorText}>{error.title}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <InputField
              label={t('addExpense.amountLabel')}
              placeholder={t('addExpense.amountPlaceholder')}
              value={model.amount}
              onChangeText={handleAmountChange}
              hasError={!!error.amount}
              keyboardType="decimal-pad"
              leftIcon={
                <AppIcon
                  name={AppIcons.amount}
                  size={18}
                  color={theme.textTertiary}
                />
              }
            />
            {error.amount ? (
              <Text style={styles.errorText}>{error.amount}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('addExpense.categoryLabel')}</Text>
            <Pressable
              style={[
                styles.selectField,
                !!error.category_id && { borderColor: theme.error },
              ]}
              onPress={() => setShowCategoryModal(true)}
            >
              <AppIcon
                name={AppIcons.category}
                size={18}
                color={theme.textTertiary}
              />
              <Text
                style={[
                  styles.selectFieldText,
                  !selectedCategory && { color: theme.placeholderColor },
                ]}
                numberOfLines={1}
              >
                {selectedCategory?.name || t('addExpense.categoryPlaceholder')}
              </Text>
              <AppIcon
                name={AppIcons.forwardArrow}
                size={16}
                color={theme.textTertiary}
              />
            </Pressable>
            {error.category_id ? (
              <Text style={styles.errorText}>{error.category_id}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('addExpense.dateLabel')}</Text>
            <Pressable
              style={[
                styles.selectField,
                !!error.expense_date && { borderColor: theme.error },
              ]}
              onPress={openDatePicker}
            >
              <AppIcon
                name={AppIcons.calendar}
                size={18}
                color={theme.textTertiary}
              />
              <Text style={styles.selectFieldText}>{dateDisplayLabel}</Text>
            </Pressable>
            {error.expense_date ? (
              <Text style={styles.errorText}>{error.expense_date}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('addExpense.receiptLabel')}</Text>
            {model.receipt_image ? (
              <View style={styles.receiptPreviewWrap}>
                <Image
                  source={{ uri: model.receipt_image }}
                  style={styles.receiptPreview}
                />
                <View style={styles.receiptActions}>
                  <Pressable onPress={handlePickReceipt} hitSlop={8}>
                    <Text style={styles.receiptActionText}>
                      {t('addExpense.changeReceipt')}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => updateField('receipt_image', null)}
                    hitSlop={8}
                  >
                    <Text style={[styles.receiptActionText, { color: theme.error }]}>
                      {t('addExpense.removeReceipt')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable style={styles.receiptUploadBox} onPress={handlePickReceipt}>
                <AppIcon
                  name={AppIcons.receipt}
                  size={22}
                  color={theme.textTertiary}
                />
                <Text style={styles.receiptUploadText}>
                  {t('addExpense.addReceipt')}
                </Text>
              </Pressable>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <InputField
              label={t('addExpense.noteLabel')}
              placeholder={t('addExpense.notePlaceholder')}
              value={model.note}
              onChangeText={(text) => updateField('note', text)}
              multiline
              height={80 * scale}
              style={styles.noteInput}
              leftIcon={
                <AppIcon
                  name={AppIcons.note}
                  size={18}
                  color={theme.textTertiary}
                />
              }
            />
          </View>

          <AppButton
            title={t('addExpense.saveButton')}
            loading={isLoading}
            disabled={isLoading}
            onPress={handleSubmit}
            style={styles.button}
          />
        </View>
      </KeyboardAwareScrollView>

      {/* Category picker modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCategoryModal(false)}
        />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>{t('addExpense.selectCategory')}</Text>

          {categoriesLoading ? (
            <View style={styles.modalStateBox}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : categoriesError ? (
            <View style={styles.modalStateBox}>
              <Text style={styles.modalErrorText}>{categoriesError}</Text>
              <Pressable onPress={fetchCategories} hitSlop={8}>
                <Text style={styles.retryText}>{t('common.retry')}</Text>
              </Pressable>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.modalStateBox}>
              <Text style={styles.modalErrorText}>
                {t('addExpense.noCategoriesFound')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => item._id}
              style={styles.categoryList}
              renderItem={({ item }) => {
                const isSelected = item._id === model.category_id;
                return (
                  <Pressable
                    style={styles.categoryRow}
                    onPress={() => {
                      updateField('category_id', item._id);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryRowText,
                        isSelected && styles.categoryRowTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelected ? (
                      <AppIcon
                        name={AppIcons.check}
                        size={18}
                        color={theme.primary}
                      />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </Modal>

      {/* iOS inline date picker */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showIosDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowIosDatePicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowIosDatePicker(false)}
          />
          <View style={styles.datePickerSheet}>
            <View style={styles.datePickerHeader}>
              <Pressable onPress={() => setShowIosDatePicker(false)} hitSlop={8}>
                <Text style={styles.datePickerCancel}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable onPress={confirmIosDate} hitSlop={8}>
                <Text style={styles.datePickerDone}>{t('common.done')}</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onValueChange={(_event, date) => {
                if (date) setTempDate(date);
              }}
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.mainBg,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 32 * verticalScale,
    },
    subtitle: {
      fontSize: 13 * scale,
      color: theme.textSecondary,
      paddingHorizontal: 20 * scale,
      paddingTop: 14 * verticalScale,
    },
    card: {
      padding: 16 * scale,
    },
    fieldGroup: {
      marginBottom: 14 * verticalScale,
    },
    fieldLabel: {
      color: theme.textSecondary,
      fontSize: 13 * scale,
      marginBottom: 3 * scale,
    },
    errorText: {
      color: theme.error,
      fontSize: 11.5 * scale,
      marginTop: 4 * verticalScale,
      marginLeft: 2 * scale,
    },
    selectField: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 48 * scale,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: 8 * scale,
      backgroundColor: theme.surfaceLight,
      paddingHorizontal: 12 * scale,
      gap: 8 * scale,
    },
    selectFieldText: {
      flex: 1,
      fontSize: 14 * scale,
      color: theme.textPrimary,
    },
    noteInput: {
      textAlignVertical: 'top',
      paddingTop: 10 * scale,
    },
    receiptUploadBox: {
      height: 90 * scale,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.borderColor,
      borderRadius: 8 * scale,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6 * scale,
    },
    receiptUploadText: {
      fontSize: 12.5 * scale,
      color: theme.textTertiary,
    },
    receiptPreviewWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12 * scale,
    },
    receiptPreview: {
      width: 64 * scale,
      height: 64 * scale,
      borderRadius: 8 * scale,
      backgroundColor: theme.surfaceLight,
    },
    receiptActions: {
      gap: 8 * verticalScale,
    },
    receiptActionText: {
      fontSize: 13 * scale,
      fontWeight: '700',
      color: theme.primary,
    },
    button: {
      width: '100%',
      marginTop: 8 * verticalScale,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalSheet: {
      backgroundColor: theme.mainBg,
      borderTopLeftRadius: 22 * scale,
      borderTopRightRadius: 22 * scale,
      paddingHorizontal: 18 * scale,
      paddingTop: 16 * scale,
      paddingBottom: 20 * scale,
      maxHeight: '70%',
    },
    modalTitle: {
      fontSize: 16 * scale,
      fontWeight: '800',
      color: theme.textPrimary,
      marginBottom: 10 * verticalScale,
    },
    modalStateBox: {
      paddingVertical: 28 * verticalScale,
      alignItems: 'center',
      gap: 10 * verticalScale,
    },
    modalErrorText: {
      color: theme.textSecondary,
      fontSize: 13.5 * scale,
      textAlign: 'center',
    },
    retryText: {
      color: theme.primary,
      fontWeight: '700',
      fontSize: 13.5 * scale,
    },
    categoryList: {
      flexGrow: 0,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14 * verticalScale,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    categoryRowText: {
      fontSize: 14.5 * scale,
      color: theme.textPrimary,
    },
    categoryRowTextSelected: {
      color: theme.primary,
      fontWeight: '700',
    },
    datePickerSheet: {
      backgroundColor: theme.mainBg,
      borderTopLeftRadius: 22 * scale,
      borderTopRightRadius: 22 * scale,
      paddingBottom: 20 * scale,
    },
    datePickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 18 * scale,
      paddingVertical: 14 * verticalScale,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    datePickerCancel: {
      fontSize: 14 * scale,
      color: theme.textSecondary,
    },
    datePickerDone: {
      fontSize: 14 * scale,
      color: theme.primary,
      fontWeight: '700',
    },
  });
