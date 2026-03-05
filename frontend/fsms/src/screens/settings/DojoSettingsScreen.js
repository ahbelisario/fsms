import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { api } from "@/src/api/client";
import { ScreenStyles } from '@/src/styles/appStyles';
import { t } from "@/src/i18n";

export default function DojoSettingsScreen({ onAuthExpired }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [activeTab, setActiveTab] = useState("general");

  // Información general
  const [dojoName, setDojoName] = useState("");
  const [shortName, setShortName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // Contacto
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  // Dirección
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("México");

  // Legal
  const [taxId, setTaxId] = useState("");
  const [legalName, setLegalName] = useState("");

  // Redes sociales
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");

  // Configuración
  const [currency, setCurrency] = useState("MXN");
  const [timezone, setTimezone] = useState("America/Mexico_City");
  const [language, setLanguage] = useState("es");

  // Políticas
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [termsConditions, setTermsConditions] = useState("");

  const tabs = [
    { id: "general", label: t("dojo.general"), icon: "📋" },
    { id: "location", label: t("dojo.location"), icon: "📍" },
    { id: "legal", label: t("dojo.legal"), icon: "🏛️" },
    { id: "social", label: t("dojo.social"), icon: "🌐" },
    { id: "policies", label: t("dojo.policies"), icon: "📜" },
  ];

  function clearMsgs() {
    setError("");
    setSuccess("");
  }

  async function loadSettings() {
    clearMsgs();
    setLoading(true);
    try {
      const response = await api.getDojoSettings();
      const data = response.data || response;

      setDojoName(data.dojo_name || "");
      setShortName(data.short_name || "");
      setLogoUrl(data.logo_url || "");
      setPhone(data.phone || "");
      setEmail(data.email || "");
      setWebsite(data.website || "");
      setAddressLine1(data.address_line1 || "");
      setAddressLine2(data.address_line2 || "");
      setCity(data.city || "");
      setState(data.state || "");
      setPostalCode(data.postal_code || "");
      setCountry(data.country || "México");
      setTaxId(data.tax_id || "");
      setLegalName(data.legal_name || "");
      setFacebookUrl(data.facebook_url || "");
      setInstagramUrl(data.instagram_url || "");
      setTwitterUrl(data.twitter_url || "");
      setCurrency(data.currency || "MXN");
      setTimezone(data.timezone || "America/Mexico_City");
      setLanguage(data.language || "es");
      setPrivacyPolicy(data.privacy_policy || "");
      setTermsConditions(data.terms_conditions || "");

    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo cargar la configuración.");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  function validate() {
    if (!dojoName.trim()) return "El nombre del dojo es requerido.";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Email inválido.";
    }
    return "";
  }

  async function save() {
    clearMsgs();
    const v = validate();
    if (v) return setError(v);

    setSaving(true);
    try {
      const payload = {
        dojo_name: dojoName.trim(),
        short_name: shortName.trim() || null,
        logo_url: logoUrl.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        website: website.trim() || null,
        address_line1: addressLine1.trim() || null,
        address_line2: addressLine2.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        postal_code: postalCode.trim() || null,
        country: country.trim() || null,
        tax_id: taxId.trim() || null,
        legal_name: legalName.trim() || null,
        facebook_url: facebookUrl.trim() || null,
        instagram_url: instagramUrl.trim() || null,
        twitter_url: twitterUrl.trim() || null,
        currency: currency,
        timezone: timezone,
        language: language,
        privacy_policy: privacyPolicy.trim() || null,
        terms_conditions: termsConditions.trim() || null,
      };

      await api.updateDojoSettings(payload);
      setSuccess("Configuración actualizada exitosamente.");
      
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[ScreenStyles.page, ScreenStyles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={ScreenStyles.page}>
      <View style={ScreenStyles.header}>
        <Text style={ScreenStyles.title}>{t("dojo.settings")}</Text>
      </View>

      {error ? (
        <View style={ScreenStyles.alertError}>
          <Text style={ScreenStyles.alertErrorText}>{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View style={ScreenStyles.alertOk}>
          <Text style={ScreenStyles.alertOkText}>{success}</Text>
        </View>
      ) : null}

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{ 
          maxHeight: 50, 
          marginBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0'
        }}
      >
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 3,
                borderBottomColor: activeTab === tab.id ? '#3b82f6' : 'transparent',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: activeTab === tab.id ? '600' : '400',
                color: activeTab === tab.id ? '#3b82f6' : '#64748b',
              }}>
                {tab.icon} {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <ScrollView style={{ flex: 1 }}>
        {/* TAB: General */}
        {activeTab === "general" && (
          <View>
            <Text style={ScreenStyles.label}>{t("dojo.name")} *</Text>
            <TextInput
              style={ScreenStyles.input}
              value={dojoName}
              onChangeText={setDojoName}
              placeholder="Ej: Academia de Artes Marciales"
              placeholderTextColor="#94a3b8"
            />

            <Text style={ScreenStyles.label}>{t("dojo.shortname")}</Text>
            <TextInput
              style={ScreenStyles.input}
              value={shortName}
              onChangeText={setShortName}
              placeholder="Ej: AAM"
              placeholderTextColor="#94a3b8"
            />

            <Text style={ScreenStyles.label}>{t("dojo.logourl")}</Text>
            <TextInput
              style={ScreenStyles.input}
              value={logoUrl}
              onChangeText={setLogoUrl}
              placeholder="https://ejemplo.com/logo.png"
              placeholderTextColor="#94a3b8"
            />

            <Text style={ScreenStyles.label}>{t("common.phone")}</Text>
            <TextInput
              style={ScreenStyles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+52 555 123 4567"
              keyboardType="phone-pad"
              placeholderTextColor="#94a3b8"
            />

            <Text style={ScreenStyles.label}>{t("common.email")}</Text>
            <TextInput
              style={ScreenStyles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="contacto@dojo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
            />

            <Text style={ScreenStyles.label}>{t("dojo.website")}</Text>
            <TextInput
              style={ScreenStyles.input}
              value={website}
              onChangeText={setWebsite}
              placeholder="https://www.dojo.com"
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
            />
          </View>
        )}

        {/* TAB: Ubicación */}
        {activeTab === "location" && (
          <View>
            <Text style={ScreenStyles.label}>{t("dojo.address1")}</Text>
            <TextInput
              style={ScreenStyles.input}
              value={addressLine1}
              onChangeText={setAddressLine1}
              placeholder="Calle Principal #123"
              placeholderTextColor="#94a3b8"
            />

            <Text style={ScreenStyles.label}>{t("dojo.address2")}</Text>
            <TextInput
              style={ScreenStyles.input}
              value={addressLine2}
              onChangeText={setAddressLine2}
              placeholder="Colonia, edificio, piso, etc."
              placeholderTextColor="#94a3b8"
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("dojo.city")}</Text>
                <TextInput
                  style={ScreenStyles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Ciudad"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("dojo.state")}</Text>
                <TextInput
                  style={ScreenStyles.input}
                  value={state}
                  onChangeText={setState}
                  placeholder="Estado"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("dojo.postalcode")}</Text>
                <TextInput
                  style={ScreenStyles.input}
                  value={postalCode}
                  onChangeText={setPostalCode}
                  placeholder="12345"
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("dojo.country")}</Text>
                <TextInput
                  style={ScreenStyles.input}
                  value={country}
                  onChangeText={setCountry}
                  placeholder="México"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <Text style={[ScreenStyles.label, { marginTop: 16 }]}>{t("dojo.config")}</Text>

            <Text style={ScreenStyles.label}>{t("common.currency")}</Text>
            <View style={ScreenStyles.pickerWrapper}>
              <Picker
                selectedValue={currency}
                onValueChange={setCurrency}
              >
                <Picker.Item label="MXN - Peso Mexicano" value="MXN" />
                <Picker.Item label="USD - Dólar" value="USD" />
                <Picker.Item label="EUR - Euro" value="EUR" />
              </Picker>
            </View>

            <Text style={ScreenStyles.label}>{t("dojo.language")}</Text>
            <View style={ScreenStyles.pickerWrapper}>
              <Picker
                selectedValue={language}
                onValueChange={setLanguage}
              >
                <Picker.Item label="Español" value="es" />
                <Picker.Item label="English" value="en" />
              </Picker>
            </View>
          </View>
        )}

        {/* TAB: Legal */}
        {activeTab === "legal" && (
          <View>
            <Text style={ScreenStyles.label}>{t("dojo.taxid")}</Text>
            <TextInput
              style={ScreenStyles.input}
              value={taxId}
              onChangeText={setTaxId}
              placeholder="RFC (México)"
              autoCapitalize="characters"
              placeholderTextColor="#94a3b8"
            />

            <Text style={ScreenStyles.label}>{t("dojo.legalname")}</Text>
            <TextInput
              style={ScreenStyles.input}
              value={legalName}
              onChangeText={setLegalName}
              placeholder="Razón Social Completa S.A. de C.V."
              placeholderTextColor="#94a3b8"
            />
          </View>
        )}

        {/* TAB: Redes Sociales */}
        {activeTab === "social" && (
          <View>
            <Text style={ScreenStyles.label}>Facebook</Text>
            <TextInput
              style={ScreenStyles.input}
              value={facebookUrl}
              onChangeText={setFacebookUrl}
              placeholder="https://facebook.com/tu-dojo"
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
            />

            <Text style={ScreenStyles.label}>Instagram</Text>
            <TextInput
              style={ScreenStyles.input}
              value={instagramUrl}
              onChangeText={setInstagramUrl}
              placeholder="https://instagram.com/tu-dojo"
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
            />

            <Text style={ScreenStyles.label}>Twitter / X</Text>
            <TextInput
              style={ScreenStyles.input}
              value={twitterUrl}
              onChangeText={setTwitterUrl}
              placeholder="https://twitter.com/tu-dojo"
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
            />
          </View>
        )}

        {/* TAB: Políticas */}
        {activeTab === "policies" && (
          <View>
            <Text style={ScreenStyles.label}>{t("dojo.privacypolicy")}</Text>
            <TextInput
              style={ScreenStyles.textArea}
              value={privacyPolicy}
              onChangeText={setPrivacyPolicy}
              multiline
              numberOfLines={8}
              placeholder="Política de privacidad y manejo de datos..."
              placeholderTextColor="#94a3b8"
            />

            <Text style={ScreenStyles.label}>{t("dojo.terms")}</Text>
            <TextInput
              style={ScreenStyles.textArea}
              value={termsConditions}
              onChangeText={setTermsConditions}
              multiline
              numberOfLines={8}
              placeholder="Términos y condiciones de uso..."
              placeholderTextColor="#94a3b8"
            />
          </View>
        )}

        <View style={{ marginTop: 24, marginBottom: 40 }}>
          <Pressable
            style={[ScreenStyles.btnPrimary, { opacity: saving ? 0.7 : 1 }]}
            onPress={save}
            disabled={saving}
          >
            <Text style={ScreenStyles.btnPrimaryText}>
              {saving ? t("common.saving") : t("common.save")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}