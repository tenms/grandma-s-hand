export const fallbackImages = {
  profile: "images/grandma.svg",
  product: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80",
  experience: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=80"
};

export const defaultData = {
  profile: {
    siteName: "할머니손",
    subtitle: "시골 먹거리와 장 만들기 체험",
    profileName: "김순자 할머니",
    phone: "010-1234-5678",
    address: "경상북도 OO군 OO면 OO길 123",
    profileImage: fallbackImages.profile,
    quote: "좋은 재료로 정직하게 준비합니다.",
    heroDesc: "할머니가 준비한 판매 물건과 장 만들기 체험을 쉽게 확인할 수 있습니다. 주문과 예약은 전화로 편하게 문의해 주세요."
  },
  products: [
    {
      name: "햇감자",
      price: "10,000원",
      source: "할머니 직접 판매",
      status: "판매중",
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=80",
      desc: "직접 캔 신선한 감자입니다. 찜, 반찬, 국거리로 좋습니다."
    },
    {
      name: "수제 고추장",
      price: "18,000원",
      source: "이웃 어르신 판매",
      status: "수량 적음",
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=700&q=80",
      desc: "이웃 어르신이 직접 담근 고추장입니다. 수량이 적을 수 있습니다."
    }
  ],
  experiences: [
    {
      title: "장 만들기 체험",
      price: "1인 25,000원",
      time: "약 2시간",
      status: "예약 가능",
      image: fallbackImages.experience,
      desc: "된장과 고추장을 만드는 과정을 직접 보고 배울 수 있는 체험입니다."
    },
    {
      title: "김치 담그기 체험",
      price: "1인 30,000원",
      time: "약 2~3시간",
      status: "전화 문의",
      image: "https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=900&q=80",
      desc: "계절 재료로 김치를 담그고 포장해 가져갈 수 있는 체험입니다."
    }
  ],
  schedules: [
    { date: "2026-06-01", type: "상품 준비", memo: "햇감자 10상자 포장 준비" },
    { date: "2026-06-03", type: "체험 예약", memo: "장 만들기 체험 4명 방문 예정" },
    { date: "2026-06-05", type: "개인 메모", memo: "박영희 어르신 고추장 5개 수령" }
  ]
};


export const imageLibrary = {
  profile: fallbackImages.profile,
  farm: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=80",
  gochujang: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=700&q=80",
  doenjang: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=700&q=80",
  oil: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=700&q=80",
  vegetable: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80",
  defaultProduct: fallbackImages.product,
  jang: fallbackImages.experience,
  kimchi: "https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=900&q=80",
  farmExperience: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
  defaultExperience: fallbackImages.experience
};

export function imageKeyFromUrl(url, fallbackKey) {
  const found = Object.entries(imageLibrary).find(([, value]) => value === url);
  return found ? found[0] : fallbackKey;
}
