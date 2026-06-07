# 私隱政策 · Privacy Policy

**生效日期 / Effective Date:** 2026-06-04  
**應用 / App:** SpeakAble HK (「本應用」/ "the App")  
**開發者 / Developer:** SpeakAble HK Team

---

## 語言 / Language

本政策提供英文及繁體中文版本。如有歧義，以英文版本為準。  
This policy is available in English and Traditional Chinese. In case of conflict, the English version prevails.

---

## 1. 我們收集的資料 / Information We Collect

### 1.1 你主動提供的資料 / Information You Provide

| 資料類型 | 說明 |
|-----------|------|
| **帳戶資料** | 姓名、電郵地址、角色（學生／治療師／家長）、密碼（經 Supabase 加密儲存） |
| **學生檔案** | 暱稱、年齡組別、治療目標、語音練習記錄 |
| **語音錄音** | 練習時錄製的粵語語音片段，用於 AI 聲線克隆及發音分析 |
| **家長關聯** | 家長帳戶與其子女帳戶之間的連結關係 |

| Data Type | Description |
|-----------|-------------|
| **Account Data** | Name, email address, role (Student / Therapist / Parent), password (encrypted via Supabase) |
| **Student Profile** | Nickname, age group, therapy goals, speech practice history |
| **Audio Recordings** | Cantonese speech clips recorded during exercises, used for AI voice cloning and pronunciation analysis |
| **Parent Link** | Association between parent accounts and their children |

### 1.2 自動收集的資料 / Automatically Collected Data

- 裝置類型及操作系統版本
- 應用使用統計（練習次數、完成率、準確度趨勢）
- 崩潰報告及效能數據（經 Capacitor 或原生 SDK）

- Device type and OS version
- Usage statistics (practice sessions, completion rates, accuracy trends)
- Crash reports and performance data (via Capacitor or native SDK)

### 1.3 我們不收集的資料 / What We Do NOT Collect

- 精確地理位置
- 通訊錄或聯絡人
- 照片或相機膠卷（除非你明確使用頭像功能）

- Precise geolocation
- Contacts or address book
- Photos or camera roll (unless you explicitly use the avatar feature)

---

## 2. 資料用途 / How We Use Your Data

| 用途 | 涉及資料 |
|------|----------|
| 提供語音練習及發音分析 | 語音錄音、練習記錄 |
| AI 聲線克隆（Voice Cloning） | 語音錄音（僅用於生成學生個人化語音模型） |
| 治療進度追蹤 | 練習記錄、準確度統計 |
| 家長監控子女進度 | 家長關聯、練習記錄 |
| NEPA 神經網絡分析 | 練習記錄、音素表現 |
| 改善服務及研究 | 匿名化的使用統計 |

| Purpose | Data Involved |
|---------|---------------|
| Provide speech exercises & pronunciation analysis | Audio recordings, practice history |
| AI Voice Cloning | Audio recordings (used only to generate the student's personalized voice model) |
| Therapy progress tracking | Practice history, accuracy statistics |
| Parental progress monitoring | Parent-student link, practice history |
| NEPA neural network analysis | Practice history, phoneme performance |
| Service improvement & research | Anonymized usage statistics |

### Voice Cloning 特別說明 / Voice Cloning Specifics

語音錄音僅用於為該學生生成個人化聲線模型。錄音不會與其他用戶分享，也不會用於訓練公開模型。你可隨時要求刪除所有錄音及聲線模型。  
Audio recordings are used solely to generate a personalized voice model for that student. Recordings are never shared with other users or used to train public models. You may request deletion of all recordings and voice models at any time.

---

## 3. 資料分享 / Data Sharing

我們 **不會** 出售你的個人資料。我們僅在以下情況與第三方分享必要資料：

We **do not sell** your personal data. We share with third parties only when necessary:

| 第三方 | 用途 | 資料 |
|--------|------|------|
| **Supabase** | 資料庫及認證 | 帳戶資料、加密密碼、練習記錄 |
| **NEPA / Speakable Core** | 神經網絡分析 | 匿名化的練習記錄及音素數據 |
| **OpenRouter** | AI 教學見解（家長入口） | 匿名化的進度摘要（不含姓名或錄音） |
| **Apple / Google** | 應用分發及推送通知 | 裝置標識符（如適用） |

所有第三方均須遵守嚴格的資料保護協議。  
All third parties are bound by strict data processing agreements.

---

## 4. 資料儲存及安全 / Data Storage & Security

- 資料儲存於 **Supabase**（香港及亞太區域伺服器），傳輸過程使用 TLS 加密
- 密碼經 bcrypt 雜湊處理，我們無法讀取
- 語音錄音儲存於 Supabase Storage，訪問受 RLS 政策控制
- 我們採用 **Row-Level Security (RLS)** 確保用戶只能存取其授權的資料

- Data is stored on **Supabase** (Hong Kong / Asia-Pacific region), encrypted in transit via TLS
- Passwords are bcrypt-hashed; we cannot read them
- Audio recordings are stored in Supabase Storage, access-controlled via RLS policies
- We use **Row-Level Security (RLS)** to ensure users can only access data they are authorized to

---

## 5. 資料保留及刪除 / Data Retention & Deletion

| 資料類型 | 保留期限 |
|----------|----------|
| 帳戶資料 | 直至帳戶刪除 |
| 語音錄音 | 可隨時由用戶或家長刪除 |
| 練習記錄 | 保留作進度追蹤，帳戶刪除後 90 天內清除 |
| 崩潰日誌 | 最多 180 天 |

你可隨時透過應用內設定或電郵要求：
- 匯出你的資料
- 刪除你的帳戶及所有相關資料
- 刪除特定語音錄音

| Data Type | Retention Period |
|-----------|-----------------|
| Account data | Until account deletion |
| Audio recordings | Deletable at any time by user or parent |
| Practice history | Retained for progress tracking; deleted within 90 days of account deletion |
| Crash logs | Maximum 180 days |

You may request at any time via in-app settings or email:
- Export of your data
- Deletion of your account and all associated data
- Deletion of specific audio recordings

---

## 6. 兒童私隱 / Children's Privacy

本應用專為言語治療用途設計，可能由未成年人（包括兒童）使用。我們：

- 在治療師或家長同意下收集兒童的語音數據
- 不會在未經家長同意下收集兒童的個人資料
- 不會向第三方出售兒童資料
- 不會使用兒童資料作行為廣告

家長有權：
- 查看子女的練習記錄及資料
- 要求刪除子女的帳戶及所有資料
- 撤回同意

---

This app is designed for speech therapy and may be used by minors, including children. We:

- Collect voice data from children only with therapist or parental consent
- Do not collect personal information from children without parental consent
- Do not sell children's data to third parties
- Do not use children's data for behavioral advertising

Parents have the right to:
- View their child's practice history and data
- Request deletion of their child's account and all data
- Withdraw consent

---

## 7. 你的權利 / Your Rights (GDPR / PDPO)

如果你位於香港、歐盟或英國，你享有以下權利：

If you are located in Hong Kong, the EU, or the UK, you have the following rights:

| 權利 | 說明 |
|------|------|
| **查閱權** | 要求取得我們持有的你的個人資料副本 |
| **更正權** | 要求更正不準確的資料 |
| **刪除權** | 要求刪除你的資料（「被遺忘權」） |
| **限制權** | 要求限制我們處理你的資料 |
| **可攜權** | 要求以結構化格式取得你的資料 |
| **反對權** | 反對我們基於正當利益處理你的資料 |

| Right | Description |
|-------|-------------|
| **Right of Access** | Request a copy of your personal data |
| **Right to Rectification** | Request correction of inaccurate data |
| **Right to Erasure** | Request deletion of your data ("Right to be Forgotten") |
| **Right to Restriction** | Request restriction of processing |
| **Right to Portability** | Request your data in a structured format |
| **Right to Object** | Object to processing based on legitimate interests |

行使權利請聯絡：`privacy@speakable.hk`（如有）

To exercise your rights, contact: `privacy@speakable.hk`

---

## 8. 政策更新 / Changes to This Policy

我們可能不時更新本政策。重大變更將透過應用內通知或電郵告知。  
We may update this policy from time to time. Material changes will be notified via in-app notice or email.

---

## 9. 聯絡我們 / Contact Us

如有任何私隱問題或疑慮，請聯絡：  
For any privacy questions or concerns, please contact:

**電郵 / Email:** `privacy@speakable.hk`  
**通訊地址 / Address:** SpeakAble HK, Hong Kong

---

*© 2026 SpeakAble HK. All rights reserved.*
