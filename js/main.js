import { fallbackImages, defaultData } from "./defaults.js";
import { safe, phoneHref, setText, statusClass } from "./utils.js";
import { isFirebaseConfigured, watchProfile, watchProducts, watchExperiences } from "./firebase-service.js";

let currentProfile = defaultData.profile;
let currentProducts = defaultData.products;
let currentExperiences = defaultData.experiences;

function renderProfile(profile) {
  currentProfile = { ...defaultData.profile, ...profile };

  setText("siteName", currentProfile.siteName);
  setText("siteSubtitle", currentProfile.subtitle);
  setText("profileName", currentProfile.profileName);
  setText("profileQuote", "“" + currentProfile.quote + "”");
  setText("heroDesc", currentProfile.heroDesc);
  setText("addressText", currentProfile.address);
  setText("footerSiteName", currentProfile.siteName);
  setText("footerAddress", currentProfile.address);
  setText("footerPhoneLink", currentProfile.phone);

  const img = document.getElementById("profileImage");
  if (img) img.src = currentProfile.profileImage || fallbackImages.profile;

  ["headerPhoneLink", "heroPhoneLink", "asidePhoneLink", "footerPhoneLink", "mobilePhoneLink"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = phoneHref(currentProfile.phone);
  });
}

function renderProducts(products) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  currentProducts = products.length ? products : defaultData.products;
  grid.innerHTML = "";

  currentProducts.forEach(item => {
    const sourceClass = item.source === "할머니 직접 판매" ? "direct" : "friend";
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${safe(item.image || fallbackImages.product)}" alt="${safe(item.name)} 사진">
      <div>
        <span class="tag ${sourceClass}">${safe(item.source)}</span>
        <span class="status-badge ${statusClass(item.status)}">${safe(item.status || "판매중")}</span>
        <h3>${safe(item.name)}</h3>
        <p>${safe(item.desc)}</p>
        <strong>${safe(item.price)}</strong>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderExperiences(experiences) {
  const grid = document.getElementById("experienceGrid");
  if (!grid) return;

  currentExperiences = experiences.length ? experiences : defaultData.experiences;
  grid.innerHTML = "";

  currentExperiences.forEach(item => {
    const card = document.createElement("article");
    card.className = "experience-card";
    card.innerHTML = `
      <img src="${safe(item.image || fallbackImages.experience)}" alt="${safe(item.title)} 사진">
      <div>
        <span class="tag direct">${safe(item.time)}</span>
        <span class="status-badge ${statusClass(item.status)}">${safe(item.status || "예약 가능")}</span>
        <h3>${safe(item.title)}</h3>
        <p>${safe(item.desc)}</p>
        <strong>${safe(item.price)}</strong>
      </div>
    `;
    grid.appendChild(card);
  });
}

function showError(message) {
  const main = document.querySelector("main");
  if (main) {
    const box = document.createElement("div");
    box.className = "error-box";
    box.textContent = message;
    main.prepend(box);
  }
}

renderProfile(defaultData.profile);
renderProducts(defaultData.products);
renderExperiences(defaultData.experiences);

if (isFirebaseConfigured()) {
  watchProfile(renderProfile, () => showError("프로필 정보를 불러오지 못했습니다. Firebase 설정을 확인하세요."));
  watchProducts(renderProducts, () => showError("판매 상품 정보를 불러오지 못했습니다."));
  watchExperiences(renderExperiences, () => showError("체험 정보를 불러오지 못했습니다."));
} else {
  showError("Firebase 설정이 아직 입력되지 않아 더미 데이터로 표시 중입니다.");
}
