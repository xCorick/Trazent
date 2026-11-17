import type { ThemeConfig } from 'antd';
import { colors, fontFamily } from './tokens';

/** Personalización de Ant Design con los colores de Trazent. */
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: colors.blue700,
    colorInfo: colors.blue700,
    colorLink: colors.blue700,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.danger,
    colorTextBase: colors.text,
    colorBgLayout: colors.surface,
    colorBorderSecondary: colors.border,
    borderRadius: 10,
    fontFamily,
    fontSize: 15,
  },
  components: {
    Layout: {
      siderBg: colors.blue900,
      headerBg: colors.white,
      bodyBg: colors.surface,
      headerPadding: '0 24px',
    },
    Menu: {
      darkItemBg: colors.blue900,
      darkSubMenuItemBg: colors.blue900,
      darkItemSelectedBg: colors.blue700,
      darkItemColor: 'rgba(255, 255, 255, 0.78)',
      darkItemHoverColor: colors.white,
      itemHeight: 46,
      itemBorderRadius: 10,
    },
    Card: {
      borderRadiusLG: 16,
    },
    Button: {
      controlHeight: 40,
      fontWeight: 600,
      primaryShadow: 'none',
    },
    Input: { controlHeight: 42 },
    Select: { controlHeight: 42 },
    DatePicker: { controlHeight: 42 },
    Segmented: {
      itemSelectedColor: colors.blue700,
    },
  },
};
