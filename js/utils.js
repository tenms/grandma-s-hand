export function safe(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function phoneHref(phone) {
  return "tel:" + String(phone || "").replaceAll(" ", "");
}

export function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text ?? "";
}

export function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

export function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? "";
}

export function setPreview(id, src) {
  const img = document.getElementById(id);
  if (!img) return;
  img.src = src || "";
  img.style.display = src ? "block" : "none";
}

export function readImageFile(input, callback) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("이미지 파일을 선택하세요.");
    input.value = "";
    return;
  }
  callback(file);
}

export function statusClass(status) {
  if (status === "품절" || status === "예약마감") return "closed";
  if (status === "수량 적음" || status === "전화 문의") return "limited";
  return "open";
}

export function scheduleTypeClass(type) {
  if (type === "상품 준비") return "type-product";
  if (type === "체험 예약") return "type-experience";
  if (type === "방문 약속") return "type-visit";
  return "type-memo";
}

export function scheduleTypeShort(type) {
  if (type === "상품 준비") return "상품";
  if (type === "체험 예약") return "체험";
  if (type === "방문 약속") return "방문";
  return "메모";
}
