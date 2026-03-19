import React from "react";
import { View, Text } from "react-native";
import { HomeStyles } from '@/src/styles/appStyles';
import { i18n, t } from "@/src/i18n";

export default function RankProgressWidget({ rankData }) {
  if (!rankData || !rankData.has_rank) {
    return null;
  }

  const { current_rank, next_rank, progress, next_exam_date, discipline_name } = rankData;

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  return (
    <View style={HomeStyles.section}>
      <Text style={HomeStyles.sectionTitle}>🥋 {t("labels.my_progress")}</Text>

      <View style={styles.progressCard}>
        {/* Header con disciplina */}
        {discipline_name && (
          <Text style={styles.disciplineName}>{discipline_name}</Text>
        )}

        {/* Cinturones actual y siguiente */}
        <View style={styles.beltRow}>
          {/* Cinturón actual */}
          <View style={styles.beltContainer}>
            <View style={[styles.beltIcon, { backgroundColor: current_rank.color || '#64748b' }]} />
            <Text style={styles.beltLabel}>{current_rank.name}</Text>
            <Text style={styles.beltStatus}>{t("ranks.actual")}</Text>
          </View>

          {/* Flecha */}
          {next_rank && (
            <>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrowText}>→</Text>
              </View>

              {/* Próximo cinturón */}
              <View style={styles.beltContainer}>
                <View style={[styles.beltIcon, { backgroundColor: next_rank.color || '#64748b' }]} />
                <Text style={styles.beltLabel}>{next_rank.name}</Text>
                <Text style={styles.beltStatus}>{t("ranks.next")}</Text>
              </View>
            </>
          )}
        </View>

        {/* Información del examen */}
        {next_exam_date && progress && (
          <View style={styles.examInfo}>
            <Text style={styles.examLabel}>📅 {t("ranks.next_exam")}</Text>
            <Text style={styles.examDate}>{formatDate(next_exam_date)}</Text>
            {progress.days_until_exam !== null && (
              <Text style={[
                styles.daysRemaining,
                progress.days_until_exam < 30 && { color: '#f59e0b' }
              ]}>
                {progress.days_until_exam > 0 
                  ? `Faltan ${progress.days_until_exam} días` 
                  : progress.days_until_exam === 0 
                    ? '¡Hoy es el examen!' 
                    : `Pasó hace ${Math.abs(progress.days_until_exam)} días`}
              </Text>
            )}
          </View>
        )}

        {/* Requisitos y progreso */}
        {next_rank && progress && (
          <View style={styles.requirementsSection}>
            <Text style={styles.requirementsTitle}>{t("ranks.requirements_for")} {next_rank.name}:</Text>

            {/* Requisito de tiempo */}
            {next_rank.requirements_months > 0 && (
              <View style={styles.requirement}>
                <Text style={styles.requirementCheck}>
                  {progress.meets_time_requirement ? '✅' : '⏳'}
                </Text>
                <View style={styles.requirementContent}>
                  <Text style={styles.requirementText}>
                    {t("ranks.minimal_time")}: {progress.months_elapsed}/{next_rank.requirements_months} {t("labels.months").toLowerCase()}
                  </Text>
                  <View style={styles.miniProgressBar}>
                    <View style={[
                      styles.miniProgressFill, 
                      { 
                        width: `${progress.months_progress}%`,
                        backgroundColor: progress.meets_time_requirement ? '#10b981' : '#f59e0b'
                      }
                    ]} />
                  </View>
                </View>
              </View>
            )}

            {/* Requisito de asistencias */}
            {next_rank.requirements_classes > 0 && (
              <View style={styles.requirement}>
                <Text style={styles.requirementCheck}>
                  {progress.meets_class_requirement ? '✅' : '⏳'}
                </Text>
                <View style={styles.requirementContent}>
                  <Text style={styles.requirementText}>
                    {t("attendance.title")}: {progress.attendance_count}/{next_rank.requirements_classes} {t("labels.classes").toLowerCase()}
                  </Text>
                  <View style={styles.miniProgressBar}>
                    <View style={[
                      styles.miniProgressFill, 
                      { 
                        width: `${progress.classes_progress}%`,
                        backgroundColor: progress.meets_class_requirement ? '#10b981' : '#f59e0b'
                      }
                    ]} />
                  </View>
                </View>
              </View>
            )}

            {/* Progreso general */}
            <View style={styles.overallProgressSection}>
              <Text style={styles.overallProgressLabel}>{t("ranks.general_progress")}</Text>
              <View style={HomeStyles.progressBar}>
                <View style={[
                  HomeStyles.progressFill, 
                  { 
                    width: `${progress.overall_progress}%`,
                    backgroundColor: 
                      progress.ready_for_exam ? '#10b981' :
                      progress.overall_progress >= 50 ? '#f59e0b' : '#3b82f6'
                  }
                ]} />
              </View>
              <Text style={styles.overallProgressText}>
                {progress.overall_progress}%
                {progress.ready_for_exam && ' - ¡Listo para el examen! 🎉'}
              </Text>
            </View>
          </View>
        )}

        {/* Sin siguiente grado */}
        {!next_rank && (
          <View style={styles.maxRankBanner}>
            <Text style={styles.maxRankText}>
              🏆 ¡{t("ranks.maximal_rank")} {discipline_name}!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = {
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disciplineName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
  },
  beltRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  beltContainer: {
    alignItems: 'center',
    flex: 1,
  },
  beltIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#8a8a8a54',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  beltLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 2,
  },
  beltStatus: {
    fontSize: 11,
    color: '#64748b',
  },
  arrowContainer: {
    paddingHorizontal: 10,
  },
  arrowText: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: '700',
  },
  examInfo: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  examLabel: {
    fontSize: 12,
    color: '#1e40af',
    marginBottom: 4,
    fontWeight: '600',
  },
  examDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  daysRemaining: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '500',
  },
  requirementsSection: {
    gap: 12,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  requirementCheck: {
    fontSize: 18,
    marginTop: 2,
  },
  requirementContent: {
    flex: 1,
  },
  requirementText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 6,
  },
  miniProgressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  overallProgressSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  overallProgressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  overallProgressText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
  maxRankBanner: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  maxRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    textAlign: 'center',
  },
};