import { useApp } from "./AppContext.jsx";

// ============================================================================
// useFormSection — hook helper untuk akses & update satu section forms
//
// Setiap form section (identitas, peluang, kuesioner, dll) punya path
// state.forms.[section]. Hook ini memberi API ringkas:
//
//   const [data, setField, setBatch] = useFormSection("identitas");
//   data.namaBisnis           // baca
//   setField("namaBisnis", v) // tulis satu field
//   setBatch({a, b, c})       // tulis batch
//
// Pola ini menjaga konsistensi update lintas form section.
// ============================================================================

export function useFormSection(sectionName) {
  const { state, patch } = useApp();
  const data = state.forms?.[sectionName] || {};

  const setField = (key, value) => {
    patch(`forms.${sectionName}`, { [key]: value });
  };

  const setBatch = (obj) => {
    patch(`forms.${sectionName}`, obj);
  };

  return [data, setField, setBatch];
}
