import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';
import type { Tone } from '@/theme/tokens';
import { ReviewStatus } from '@/types';
import type { Evidence } from '@/types';
import { AppText, Badge } from '@/ui';
import { formatDateTime } from '@/utils/format';

const review: Record<ReviewStatus, { label: string; tone: Tone }> = {
  [ReviewStatus.Pending]: { label: 'En revisión', tone: 'orange' },
  [ReviewStatus.Approved]: { label: 'Aprobada', tone: 'green' },
  [ReviewStatus.Rejected]: { label: 'Rechazada', tone: 'red' },
};

interface EvidenceItemProps {
  /** Evidencia ya enviada, o una en cola (solo con foto, fecha y comentario). */
  evidence: Pick<Evidence, 'fileUrl' | 'capturedAtDevice' | 'comment'> & Partial<Evidence>;
  queued?: boolean;
}

export function EvidenceItem({ evidence, queued = false }: EvidenceItemProps) {
  const status = evidence.reviewStatus !== undefined ? review[evidence.reviewStatus] : null;
  return (
    <View style={styles.row}>
      <Image source={{ uri: evidence.fileUrl }} style={styles.thumb} contentFit="cover" />
      <View style={styles.body}>
        {queued ? (
          <Badge tone="gray" icon="cloudOff" label="Pendiente de enviar" />
        ) : (
          status && <Badge tone={status.tone} label={status.label} />
        )}
        <AppText variant="caption" tone="muted">
          {formatDateTime(evidence.capturedAtDevice)}
        </AppText>
        {evidence.comment && <AppText variant="small">{evidence.comment}</AppText>}
        {evidence.reviewStatus === ReviewStatus.Rejected && evidence.reviewerComment && (
          <AppText variant="small" tone="danger">
            Motivo: {evidence.reviewerComment}
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm },
  thumb: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.grayBg },
  body: { flex: 1, gap: spacing.xs },
});
