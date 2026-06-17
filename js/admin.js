import { fallbackImages, defaultData, imageLibrary, imageKeyFromUrl } from "./defaults.js";
import {
  safe, getValue, setValue,
  scheduleTypeClass, scheduleTypeShort
} from "./utils.js";
import {
  isFirebaseConfigured, loginAdmin, logoutAdmin, watchAuth,
  watchProfile, watchProducts, watchExperiences, watchSchedules,
  saveProfile, addProduct, updateProduct, deleteProductDoc,
  addExperience, updateExperience, deleteExperienceDoc,
  addSchedule, deleteScheduleDoc,
  seedDefaultData, resetDefaultData
} from "./firebase-service.js";

let profileData = defaultData.profile;
let products = [];
let experiences = [];
let schedules = [];

let editingProductId = null;
let editingExperienceId = null;

const ADMIN_PIN_KEY = "halmeonison_admin_pin_v1";

function getAdminPin() {
  return localStorage.getItem(ADMIN_PIN_KEY) || "1234";
}

function setAdminPin(pin) {
  localStorage.setItem(ADMIN_PIN_KEY, pin);
}

function showAdminError(message) {
  alert(message);
}

function fillProfileForm(profile) {
  profileData = { ...defaultData.profile, ...profile };
  setValue("editSiteName", profileData.siteName);
  setValue("editSubtitle", profileData.subtitle);
  setValue("editProfileName", profileData.profileName);
  setValue("editPhone", profileData.phone);
  setValue("editAddress", profileData.address);
  setValue("editQuote", profileData.quote);
  setValue("editHeroDesc", profileData.heroDesc);
  setValue("editProfileImage", imageKeyFromUrl(profileData.profileImage, "profile"));
}

function renderAdminProducts(items) {
  const list = document.getElementById("adminProductList");
  if (!list) return;
  products = items;
  list.innerHTML = "";

  if (!products.length) {
    list.innerHTML = `<div class="empty-text">등록된 상품이 없습니다.</div>`;
    return;
  }

  products.forEach(item => {
    const row = document.createElement("div");
    row.className = "admin-item";
    row.innerHTML = `
      <img class="admin-thumb" src="${safe(item.image || fallbackImages.product)}" alt="">
      <div>
        <strong>${safe(item.name)} · ${safe(item.price)}</strong>
        <span>${safe(item.source)} / ${safe(item.status || "판매중")}</span>
        <span>${safe(item.desc)}</span>
      </div>
      <div class="item-actions">
        <button class="small-btn" type="button" data-edit-product="${item.id}">수정</button>
        <button class="small-btn" type="button" data-status-product="${item.id}">상태 변경</button>
        <button class="small-btn delete" type="button" data-delete-product="${item.id}">삭제</button>
      </div>
    `;
    list.appendChild(row);
  });
}

function renderAdminExperiences(items) {
  const list = document.getElementById("adminExperienceList");
  if (!list) return;
  experiences = items;
  list.innerHTML = "";

  if (!experiences.length) {
    list.innerHTML = `<div class="empty-text">등록된 체험이 없습니다.</div>`;
    return;
  }

  experiences.forEach(item => {
    const row = document.createElement("div");
    row.className = "admin-item";
    row.innerHTML = `
      <img class="admin-thumb" src="${safe(item.image || fallbackImages.experience)}" alt="">
      <div>
        <strong>${safe(item.title)} · ${safe(item.price)}</strong>
        <span>${safe(item.time)} / ${safe(item.status || "예약 가능")}</span>
        <span>${safe(item.desc)}</span>
      </div>
      <div class="item-actions">
        <button class="small-btn" type="button" data-edit-experience="${item.id}">수정</button>
        <button class="small-btn delete" type="button" data-delete-experience="${item.id}">삭제</button>
      </div>
    `;
    list.appendChild(row);
  });
}

function renderAdminSchedules(items) {
  const list = document.getElementById("adminScheduleList");
  if (!list) return;

  schedules = items;
  list.innerHTML = "";
  schedules.forEach(item => {
    const row = document.createElement("div");
    row.className = "schedule-item";
    row.innerHTML = `
      <div>
        <strong>${safe(item.date)} · ${safe(item.type)}</strong>
        <span>${safe(item.memo)}</span>
      </div>
      <div class="item-actions">
        <button class="small-btn delete" type="button" data-delete-schedule="${item.id}">삭제</button>
      </div>
    `;
    list.appendChild(row);
  });

  renderScheduleCalendar();
}

function renderScheduleCalendar() {
  const calendar = document.getElementById("scheduleCalendar");
  if (!calendar) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();

  let html = `<div class="calendar-title">${year}년 ${month + 1}월 일정</div>`;
  html += `<div class="calendar-legend">
    <span class="legend-dot type-product">상품</span>
    <span class="legend-dot type-experience">체험</span>
    <span class="legend-dot type-visit">방문</span>
    <span class="legend-dot type-memo">메모</span>
  </div>`;
  html += `<div class="calendar-grid calendar-head">
    <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
  </div><div class="calendar-grid">`;

  for (let i = 0; i < startDay; i++) html += `<div class="calendar-cell empty"></div>`;

  for (let day = 1; day <= last.getDate(); day++) {
    const dateText = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const daySchedules = schedules.filter(item => item.date === dateText);
    const isToday = day === today.getDate();
    const pills = daySchedules.slice(0, 2).map(item =>
      `<span class="calendar-pill ${scheduleTypeClass(item.type)}">${scheduleTypeShort(item.type)}</span>`
    ).join("");

    html += `<button class="calendar-cell ${daySchedules.length ? "has-schedule" : ""} ${isToday ? "today" : ""}"
      type="button" data-calendar-date="${dateText}">
      <b>${day}</b>
      ${pills}
      ${daySchedules.length > 2 ? `<small>+${daySchedules.length - 2}</small>` : ""}
    </button>`;
  }

  html += "</div>";
  calendar.innerHTML = html;
}

function showScheduleDetail(dateText) {
  const detail = document.getElementById("calendarDayDetail");
  if (!detail) return;

  const daySchedules = schedules.filter(item => item.date === dateText);
  if (!daySchedules.length) {
    detail.innerHTML = `<strong>${dateText}</strong><p>등록된 일정이 없습니다.</p>`;
    return;
  }

  detail.innerHTML = `<strong>${dateText} 일정</strong>` + daySchedules.map(item => `
    <div class="detail-schedule-row ${scheduleTypeClass(item.type)}">
      <span>${safe(item.type)}</span>
      <p>${safe(item.memo)}</p>
    </div>
  `).join("");
}

function showTab(targetId) {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.target === targetId);
  });
  document.querySelectorAll(".admin-section").forEach(section => {
    section.classList.toggle("active", section.id === targetId);
  });
}

function clearProductForm() {
  ["productName", "productPrice", "productDesc"].forEach(id => setValue(id, ""));
  setValue("productSource", "할머니 직접 판매");
  setValue("productStatus", "판매중");
  setValue("productImageSelect", "potato");
  editingProductId = null;
  document.getElementById("addProductBtn").textContent = "상품 추가";
  document.getElementById("cancelProductEditBtn")?.classList.add("hidden");
}

function clearExperienceForm() {
  ["experienceTitle", "experiencePrice", "experienceTime", "experienceDesc"].forEach(id => setValue(id, ""));
  setValue("experienceStatus", "예약 가능");
  setValue("experienceImageSelect", "jang");
  editingExperienceId = null;
  document.getElementById("addExperienceBtn").textContent = "체험 추가";
  document.getElementById("cancelExperienceEditBtn")?.classList.add("hidden");
}

function startEditProduct(id) {
  const item = products.find(product => product.id === id);
  if (!item) return;

  editingProductId = id;
  setValue("productName", item.name);
  setValue("productPrice", item.price);
  setValue("productSource", item.source || "할머니 직접 판매");
  setValue("productStatus", item.status || "판매중");
  setValue("productDesc", item.desc);
  setValue("productImageSelect", imageKeyFromUrl(item.image, "defaultProduct"));

  document.getElementById("addProductBtn").textContent = "상품 수정 저장";
  document.getElementById("cancelProductEditBtn")?.classList.remove("hidden");
  showTab("productTab");
  document.getElementById("productName")?.focus();
}

function startEditExperience(id) {
  const item = experiences.find(experience => experience.id === id);
  if (!item) return;

  editingExperienceId = id;
  setValue("experienceTitle", item.title);
  setValue("experiencePrice", item.price);
  setValue("experienceTime", item.time);
  setValue("experienceStatus", item.status || "예약 가능");
  setValue("experienceDesc", item.desc);
  setValue("experienceImageSelect", imageKeyFromUrl(item.image, "defaultExperience"));

  document.getElementById("addExperienceBtn").textContent = "체험 수정 저장";
  document.getElementById("cancelExperienceEditBtn")?.classList.remove("hidden");
  showTab("experienceTab");
  document.getElementById("experienceTitle")?.focus();
}

function bindEvents() {
  document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const pin = getValue("adminPin");

    if (pin !== getAdminPin()) {
      showAdminError("관리자 번호가 맞지 않습니다.");
      return;
    }

    try {
      await loginAdmin();
    } catch (error) {
      showAdminError("Firebase 익명 로그인에 실패했습니다. Firebase 설정과 Anonymous Auth 활성화를 확인하세요.");
    }
  });

  document.getElementById("logoutBtn")?.addEventListener("click", logoutAdmin);

  document.querySelectorAll(".tab-btn").forEach(button => {
    button.addEventListener("click", () => showTab(button.dataset.target));
  });

  document.getElementById("saveProfileBtn")?.addEventListener("click", async () => {
    try {
      const profileImage = imageLibrary[getValue("editProfileImage")] || fallbackImages.profile;

      await saveProfile({
        siteName: getValue("editSiteName"),
        subtitle: getValue("editSubtitle"),
        profileName: getValue("editProfileName"),
        phone: getValue("editPhone"),
        address: getValue("editAddress"),
        profileImage,
        quote: getValue("editQuote"),
        heroDesc: getValue("editHeroDesc")
      });

      alert("프로필이 저장되었습니다.");
    } catch (error) {
      showAdminError("프로필 저장에 실패했습니다.");
    }
  });

  document.getElementById("addProductBtn")?.addEventListener("click", async () => {
    const name = getValue("productName");
    const price = getValue("productPrice");
    const source = getValue("productSource");
    const status = getValue("productStatus");
    const desc = getValue("productDesc");

    if (!name || !price || !desc) {
      alert("상품명, 가격, 설명은 꼭 입력하세요.");
      return;
    }

    try {
      const image = imageLibrary[getValue("productImageSelect")] || fallbackImages.product;
      const item = { name, price, source, status, image, desc };

      if (editingProductId) {
        await updateProduct(editingProductId, item);
        alert("상품 정보가 수정되었습니다.");
      } else {
        await addProduct(item);
      }

      clearProductForm();
    } catch (error) {
      showAdminError("상품 저장에 실패했습니다.");
    }
  });

  document.getElementById("cancelProductEditBtn")?.addEventListener("click", clearProductForm);

  document.getElementById("addExperienceBtn")?.addEventListener("click", async () => {
    const title = getValue("experienceTitle");
    const price = getValue("experiencePrice");
    const time = getValue("experienceTime");
    const status = getValue("experienceStatus");
    const desc = getValue("experienceDesc");

    if (!title || !price || !time || !desc) {
      alert("체험명, 비용, 시간, 설명은 꼭 입력하세요.");
      return;
    }

    try {
      const image = imageLibrary[getValue("experienceImageSelect")] || fallbackImages.experience;
      const item = { title, price, time, status, image, desc };

      if (editingExperienceId) {
        await updateExperience(editingExperienceId, item);
        alert("체험 정보가 수정되었습니다.");
      } else {
        await addExperience(item);
      }

      clearExperienceForm();
    } catch (error) {
      showAdminError("체험 저장에 실패했습니다.");
    }
  });

  document.getElementById("cancelExperienceEditBtn")?.addEventListener("click", clearExperienceForm);

  document.getElementById("addScheduleBtn")?.addEventListener("click", async () => {
    const date = getValue("scheduleDate");
    const type = getValue("scheduleType");
    const memo = getValue("scheduleMemo");

    if (!date || !memo) {
      alert("날짜와 내용을 입력하세요.");
      return;
    }

    try {
      await addSchedule({ date, type, memo });
      setValue("scheduleDate", "");
      setValue("scheduleMemo", "");
    } catch (error) {
      showAdminError("일정 저장에 실패했습니다.");
    }
  });

  document.getElementById("changePinBtn")?.addEventListener("click", () => {
    const pin = getValue("newAdminPin");
    const confirmPin = getValue("newAdminPinConfirm");

    if (!/^\d{4}$/.test(pin)) {
      showAdminError("관리자 번호는 숫자 4자리로 입력하세요.");
      return;
    }

    if (pin !== confirmPin) {
      showAdminError("관리자 번호 확인이 다릅니다.");
      return;
    }

    setAdminPin(pin);
    setValue("newAdminPin", "");
    setValue("newAdminPinConfirm", "");
    alert("관리자 번호가 변경되었습니다.");
  });

  document.getElementById("seedDataBtn")?.addEventListener("click", async () => {
    try {
      await seedDefaultData();
      alert("기본 더미 데이터를 넣었습니다.");
    } catch (error) {
      showAdminError("더미 데이터 입력에 실패했습니다.");
    }
  });

  document.getElementById("resetBtn")?.addEventListener("click", async () => {
    if (!confirm("Firebase 데이터를 더미 데이터로 초기화할까요?")) return;
    try {
      await resetDefaultData();
      alert("초기화되었습니다.");
    } catch (error) {
      showAdminError("초기화에 실패했습니다.");
    }
  });

  document.addEventListener("click", async event => {
    const editProductId = event.target.dataset.editProduct;
    const statusProductId = event.target.dataset.statusProduct;
    const deleteProductId = event.target.dataset.deleteProduct;
    const editExperienceId = event.target.dataset.editExperience;
    const deleteExperienceId = event.target.dataset.deleteExperience;
    const deleteScheduleId = event.target.dataset.deleteSchedule;
    const calendarDate = event.target.closest("[data-calendar-date]")?.dataset.calendarDate;

    if (editProductId) startEditProduct(editProductId);

    if (statusProductId) {
      const item = products.find(product => product.id === statusProductId);
      if (!item) return;
      const statuses = ["판매중", "수량 적음", "예약마감", "품절"];
      const next = statuses[(statuses.indexOf(item.status || "판매중") + 1) % statuses.length];
      await updateProduct(statusProductId, { status: next });
    }

    if (deleteProductId && confirm("이 상품을 삭제할까요?")) {
      await deleteProductDoc(deleteProductId);
    }

    if (editExperienceId) startEditExperience(editExperienceId);

    if (deleteExperienceId && confirm("이 체험을 삭제할까요?")) {
      await deleteExperienceDoc(deleteExperienceId);
    }

    if (deleteScheduleId && confirm("이 일정을 삭제할까요?")) {
      await deleteScheduleDoc(deleteScheduleId);
    }

    if (calendarDate) showScheduleDetail(calendarDate);
  });
}

function startWatchers() {
  watchProfile(fillProfileForm, () => showAdminError("프로필을 불러오지 못했습니다."));
  watchProducts(renderAdminProducts, () => showAdminError("상품을 불러오지 못했습니다."));
  watchExperiences(renderAdminExperiences, () => showAdminError("체험을 불러오지 못했습니다."));
  watchSchedules(renderAdminSchedules, () => showAdminError("일정을 불러오지 못했습니다."));
}

bindEvents();

if (!isFirebaseConfigured()) {
  document.getElementById("loginBox")?.insertAdjacentHTML("afterbegin", `<div class="error-box">Firebase 설정값을 먼저 입력하고, Firebase Authentication에서 익명 로그인을 활성화하세요.</div>`);
}

watchAuth(user => {
  const loginBox = document.getElementById("loginBox");
  const adminPanel = document.getElementById("adminPanel");
  const loggedIn = Boolean(user);

  loginBox?.classList.toggle("hidden", loggedIn);
  adminPanel?.classList.toggle("hidden", !loggedIn);

  if (loggedIn) startWatchers();
});
