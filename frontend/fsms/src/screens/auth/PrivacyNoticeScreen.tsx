import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "@/src/i18n/LanguageProvider";
import { appStyles, ScreenStyles } from "@/src/styles/appStyles";
import { API_BASE_URL } from "@/src/config/api.config";

const PRIVACY_CONTENT = {
  es: [
    {
      title: "1. Identidad y domicilio del Responsable",
      body: "BudoDesk es responsable del tratamiento de sus datos personales. Contacto: privacy@budodesk.com | www.budodesk.com",
    },
    {
      title: "2. Datos personales que recabamos",
      body: "Recabamos datos de identificación (nombre, fecha de nacimiento), contacto (email, teléfono, dirección), datos de salud como condiciones médicas relevantes para la práctica de artes marciales, y datos de uso de la plataforma (pagos, asistencia, rangos). Para menores de edad se recaban también datos del tutor o representante legal.",
    },
    {
      title: "3. Finalidades del tratamiento",
      body: "Sus datos se usan para: administrar su cuenta y membresía, registrar asistencia y progreso, enviar notificaciones de clases y pagos, generar recibos, y cumplir obligaciones legales. De forma opcional, para comunicaciones informativas sobre mejoras de la plataforma.",
    },
    {
      title: "4. Transferencia de datos",
      body: "Podemos compartir sus datos con procesadores de pago (PayPal), proveedores de infraestructura tecnológica, autoridades competentes cuando la ley lo requiera, y la escuela de artes marciales a la que pertenece. No se realizan transferencias con fines comerciales sin su consentimiento.",
    },
    {
      title: "5. Datos sensibles",
      body: "Los datos de salud son considerados sensibles conforme a la LFPDPPP. Al proporcionarlos, usted otorga su consentimiento expreso para su tratamiento únicamente con fines de seguridad deportiva.",
    },
    {
      title: "6. Menores de edad",
      body: "No recabamos datos de menores de 13 años sin consentimiento verificable de un padre o tutor. Para usuarios de 13 a 17 años se requiere designar un representante adulto. Los representantes pueden ejercer los derechos ARCO en nombre del menor.",
    },
    {
      title: "7. Derechos ARCO",
      body: "Usted puede Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos escribiendo a privacy@budodesk.com con su nombre completo, correo registrado, derecho que desea ejercer y copia de identificación. Responderemos en máximo 20 días hábiles.",
    },
    {
      title: "8. Seguridad",
      body: "Implementamos cifrado de contraseñas, comunicaciones TLS/HTTPS, control de acceso por rol y copias de seguridad periódicas.",
    },
    {
      title: "9. Cambios al Aviso",
      body: "Nos reservamos el derecho de modificar este aviso. Los cambios serán notificados por la plataforma o correo electrónico.",
    },
    {
      title: "10. Marco legal",
      body: "Este aviso se rige por la LFPDPPP (México), el RGPD/GDPR (Unión Europea) y COPPA (Estados Unidos).",
    },
  ],
  en: [
    {
      title: "1. Identity and Contact of the Data Controller",
      body: "BudoDesk is responsible for processing your personal data. Contact: privacy@budodesk.com | www.budodesk.com",
    },
    {
      title: "2. Personal Data We Collect",
      body: "We collect identification data (name, date of birth), contact data (email, phone, address), health data such as medical conditions relevant to martial arts practice, and platform usage data (payments, attendance, ranks). For minors, we also collect data from the parent or legal guardian.",
    },
    {
      title: "3. Purposes of Processing",
      body: "Your data is used to: manage your account and membership, record attendance and progress, send class and payment notifications, generate receipts, and comply with legal obligations. Optionally, for informational communications about platform improvements.",
    },
    {
      title: "4. Data Transfers",
      body: "We may share your data with payment processors (PayPal), technology infrastructure providers, competent authorities when required by law, and the martial arts school you belong to. No transfers for commercial purposes without your consent.",
    },
    {
      title: "5. Sensitive Data",
      body: "Health data is considered sensitive under applicable law. By providing it, you expressly consent to its processing solely for sports safety purposes.",
    },
    {
      title: "6. Minors",
      body: "We do not collect data from children under 13 without verifiable parental consent. For users aged 13–17, a responsible adult must be designated as a representative. Legal representatives may exercise privacy rights on behalf of the minor.",
    },
    {
      title: "7. Your Privacy Rights",
      body: "You may Access, Rectify, Cancel or Object to the processing of your data by writing to privacy@budodesk.com with your full name, registered email, the right you wish to exercise, and a copy of your ID. We will respond within 20 business days.",
    },
    {
      title: "8. Security",
      body: "We implement password encryption, TLS/HTTPS communications, role-based access control, and regular backups.",
    },
    {
      title: "9. Changes to This Notice",
      body: "We reserve the right to modify this notice. Changes will be communicated through the platform or by email.",
    },
    {
      title: "10. Applicable Legal Framework",
      body: "This notice is governed by LFPDPPP (Mexico), GDPR (European Union), and COPPA (United States).",
    },
  ],
};

export default function PrivacyNoticeScreen() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [version, setVersion] = useState<string | null>(null);

  const content = PRIVACY_CONTENT[lang as "es" | "en"] ?? PRIVACY_CONTENT.es;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/privacy/version`)
      .then((r) => r.json())
      .then((d) => setVersion(d?.data?.version ?? null))
      .catch(() => {});
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={appStyles.page}
    >
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 20,
        width: "100%",
      }}>
        <View style={[appStyles.card, { maxWidth: 500, width: "100%", maxHeight: "90%" }]}>
          
          {/* Header del card */}
          <Text style={appStyles.title}>{t("privacy.title")}</Text>
          <Text style={appStyles.subtitle}>{t("privacy.subtitle")}</Text>
          {version && (
            <Text style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>
              {t("privacy.version")} {version}
            </Text>
          )}

          {/* Contenido scrolleable dentro del card */}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {content.map((section, index) => (
              <View key={index}>
                <Text style={[appStyles.label, { fontWeight: "700", fontSize: 13 }]}>
                  {section.title}
                </Text>
                <Text style={{ fontSize: 13, color: "#475569", lineHeight: 20, marginBottom: 12 }}>
                  {section.body}
                </Text>
                {index < content.length - 1 && (
                  <View style={{ height: 1, backgroundColor: "#e2e8f0", marginBottom: 12 }} />
                )}
              </View>
            ))}

            <View style={{ marginTop: 8, alignItems: "center", gap: 2 }}>
              <Text style={{ fontSize: 11, color: "#94a3b8" }}>privacy@budodesk.com</Text>
              <Text style={{ fontSize: 11, color: "#94a3b8" }}>www.budodesk.com</Text>
            </View>
          </ScrollView>

          {/* Botón cerrar */}
          <Pressable
            style={[appStyles.submitBtn, { marginTop: 16 }]}
            onPress={() => router.back()}
          >
            <Text style={appStyles.submitBtnText}>{t("privacy.close")}</Text>
          </Pressable>

        </View>
      </View>
    </KeyboardAvoidingView>
  );
}