// src/components/CollegeLogo.js
// Displays the real college logo inside a circular badge that resembles
// the style of official Indian college seals (outer ring + inner symbol).
//
// Load order:
//   1. Clearbit Logo API   (logo.clearbit.com)
//   2. Google Favicon API  (google.com/s2/favicons?sz=128)
//   3. Styled initials badge  (always works – no network needed)

import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import {
  getCollegeLogo,
  getCollegeLogoFallback,
  getCollegeInitials,
} from '../constants/collegeLogos';

// ── Department accent colours ────────────────────────────────────────────────
const DEPT_COLORS = {
  engineering:      '#2563eb',
  medical:          '#dc2626',
  agriculture:      '#16a34a',
  law:              '#7c3aed',
  management:       '#0284c7',
  pharmacy:         '#ea580c',
  architecture:     '#0d9488',
  arts_science:     '#4f46e5',
  commerce:         '#b45309',
  education:        '#0891b2',
  nursing:          '#be185d',
  paramedical:      '#9333ea',
  polytechnic:      '#1d4ed8',
  hotel_management: '#d97706',
  teacher_training: '#0f766e',
};

// ── Department icons shown in the fallback badge ─────────────────────────────
const DEPT_ICONS = {
  engineering:      '⚙️',
  medical:          '🩺',
  agriculture:      '🌾',
  law:              '⚖️',
  management:       '💼',
  pharmacy:         '💊',
  architecture:     '🏛️',
  arts_science:     '🎨',
  commerce:         '📊',
  education:        '📚',
  nursing:          '💉',
  paramedical:      '🔬',
  polytechnic:      '🔧',
  hotel_management: '🍽️',
  teacher_training: '📖',
};

// ── Load-state machine ───────────────────────────────────────────────────────
// Stage 0: try COLLEGE_LOGO_DIRECT (Wikipedia real logo)
// Stage 1: try Clearbit/Favicon dynamically
// Stage 2: try Google Favicon with Guessed Domain (Guaranteed Image)
const STAGE = { PRIMARY: 0, FAVICON: 1, GOOGLE_FALLBACK: 2 };

/**
 * CollegeLogo
 * @param {string}  collegeName   - exact name used in COLLEGE_LOGO_DIRECT / COLLEGE_LOGOS
 * @param {string}  department    - dept key e.g. "engineering"
 * @param {number}  size          - diameter of the inner logo circle (default 48)
 * @param {number}  borderRadius  - inner circle corner radius (default 12)
 * @param {object}  style         - extra styles applied to the outermost container
 */
export default function CollegeLogo({
  collegeName,
  department,
  size = 48,
  borderRadius = 12,
  style,
  allowDynamicFetch = true, // Enable dynamic API searches to load real logos by default
  collegeDomain = '', // Clean website domain stored in database
}) {
  const primaryUrl  = getCollegeLogo(collegeName);
  
  // Construct direct favicon URL if we already have the domain from the database spreadsheet.
  // This bypasses the need for dynamic Clearbit Suggester APIs and loads the logo instantly.
  const databaseFaviconUrl = collegeDomain
    ? `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${collegeDomain}&size=128`
    : null;

  const faviconUrl  = databaseFaviconUrl || getCollegeLogoFallback(collegeName);
  const initials    = getCollegeInitials(collegeName);
  const accentColor = DEPT_COLORS[department] || '#2563eb';
  const deptIcon    = DEPT_ICONS[department]  || '🎓';

  const [dynamicUrl, setDynamicUrl] = useState(null);
  const [stage, setStage] = useState(
    primaryUrl ? STAGE.PRIMARY : 
    (faviconUrl && (allowDynamicFetch || databaseFaviconUrl) ? STAGE.FAVICON : STAGE.GOOGLE_FALLBACK)
  );

  // If dynamic fetching is enabled and there's no static logo, fetch from Clearbit
  useEffect(() => {
    if (allowDynamicFetch && !primaryUrl && !faviconUrl && collegeName) {
      // Aggressively clean the name: remove parenthesis, numbers, dashes, commas
      let cleanName = collegeName
        .replace(/\([^)]*\)/g, ' ')
        .replace(/[0-9-]/g, ' ')
        .replace(/,/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
        
      // Truncate to first 3-4 words for broader match
      const words = cleanName.split(' ');
      const query = words.slice(0, 4).join(' ');

      fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0 && data[0].domain) {
            const googleUrl = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${data[0].domain}&size=128`;
            setDynamicUrl(googleUrl);
            setStage(STAGE.PRIMARY);
          } else {
            setStage(STAGE.GOOGLE_FALLBACK);
          }
        })
        .catch(err => {
          console.log("Autocomplete fetch failed:", err);
          setStage(STAGE.GOOGLE_FALLBACK);
        });
    }
  }, [collegeName, primaryUrl, faviconUrl, allowDynamicFetch]);

  const outerSize   = size + 8;
  const isCircular  = borderRadius >= size / 2;
  const outerRadius = isCircular ? outerSize / 2 : borderRadius + 4;

  const handleError = () => {
    if (stage === STAGE.PRIMARY) {
      if (faviconUrl && allowDynamicFetch) {
        setStage(STAGE.FAVICON);
      } else {
        setStage(STAGE.GOOGLE_FALLBACK);
      }
    } else {
      setStage(STAGE.GOOGLE_FALLBACK);
    }
  };

  // Render a gorgeous, premium, official-looking vector seal fallback
  const renderLocalSeal = () => {
    return (
      <View
        style={[
          styles.sealBg,
          {
            width: size,
            height: size,
            borderRadius: borderRadius,
            backgroundColor: accentColor,
            top: 4,
            left: 4,
            borderWidth: 1.5,
            borderColor: '#facc15', // premium gold border
          },
        ]}
      >
        <View
          style={[
            styles.sealInnerRing,
            {
              width: size - 6,
              height: size - 6,
              borderRadius: Math.max(0, borderRadius - 3),
            },
          ]}
        >
          {/* Central Department Icon */}
          <Text style={{ fontSize: size * 0.42, marginBottom: size * 0.04 }}>
            {deptIcon}
          </Text>
          
          {/* Initials Text */}
          <Text
            style={[
              styles.sealText,
              {
                fontSize: Math.max(7, size * 0.16),
                lineHeight: Math.max(9, size * 0.2),
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {initials}
          </Text>
        </View>
      </View>
    );
  };

  const showImage = stage === STAGE.PRIMARY ? !!(primaryUrl || dynamicUrl) :
                    stage === STAGE.FAVICON ? !!faviconUrl : false;

  const imageUrl = stage === STAGE.PRIMARY ? (primaryUrl || dynamicUrl) : faviconUrl;

  return (
    <View style={[{ width: outerSize, height: outerSize }, style]}>
      {/* Outer dashed ring */}
      <View
        style={[
          styles.ring,
          {
            width:        outerSize,
            height:       outerSize,
            borderRadius: outerRadius,
            borderColor:  accentColor,
          },
        ]}
      />
      {/* Logo image or fallback seal */}
      {showImage && imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.logoImage,
            {
              width:        size,
              height:       size,
              borderRadius,
              top:  4,
              left: 4,
            },
          ]}
          resizeMode="contain"
          onError={handleError}
        />
      ) : (
        renderLocalSeal()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position:    'absolute',
    borderWidth: 2.5,
    borderStyle: 'dashed',
  },
  logoImage: {
    position:        'absolute',
    backgroundColor: '#ffffff',
  },
  sealBg: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  sealInnerRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderStyle: 'solid',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  sealText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

