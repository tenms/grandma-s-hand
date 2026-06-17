할머니손 Firestore 전용 실시간 수정 버전

핵심 방향:
- Firebase Storage는 무료 요금제에서 막힐 수 있어 제거했습니다.
- 이 버전은 Firestore만 사용합니다.
- 상품명, 가격, 설명, 상태, 체험, 일정은 실시간 수정됩니다.
- 이미지는 직접 업로드하지 않고, 관리자 화면에서 준비된 대표 사진을 선택합니다.
- 따라서 Netlify + GitHub + Firebase Firestore만으로 운영 가능합니다.

필수 Firebase 설정:
1. js/firebase-config.js에 Firebase 웹 앱 설정값을 입력합니다.
2. Firebase Authentication에서 Anonymous 로그인을 활성화합니다.
3. Firestore Database를 생성합니다.
4. Storage는 만들지 않아도 됩니다.

Firestore Rules 예시:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /site/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /products/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /experiences/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /schedules/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}

사용:
1. Netlify에 전체 파일을 업로드합니다.
2. /admin.html로 접속합니다.
3. 관리자 번호 1234를 입력합니다.
4. '기본 더미 데이터 넣기'를 누릅니다.
5. 이후 프로필, 판매 상품, 체험, 일정 수정이 모든 기기에 실시간 반영됩니다.

주의:
- 관리자 번호 4자리는 편의용입니다. 강한 보안 방식은 아닙니다.
- 이미지 직접 업로드가 꼭 필요하면 나중에 Cloudinary 같은 별도 이미지 저장소를 붙이면 됩니다.


추가 수정:
- images/grandma.svg 임의 프로필 이미지를 추가했습니다.
- 기본 할머니 프로필 사진은 외부 URL이 아니라 프로젝트 내부 images/grandma.svg를 사용합니다.
- 실제 사진으로 바꾸려면 images/grandma.svg 파일을 같은 이름의 실제 이미지로 교체하거나, js/defaults.js의 imageLibrary.profile 경로를 수정하세요.

수정: admin.js 281번째 줄 부근의 괄호 문법 오류를 고쳤습니다.
