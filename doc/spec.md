# Quillet — P2P Messenger Desktop App

## Обзор

Desktop P2P мессенджер на **Wails v2** (Go + React/TypeScript). Подход сверху вниз: UI первый, backend — заглушка через Go интерфейс. Стиль: **Material Design** (MUI). v1: **1-на-1 текстовый чат**.

| Компонент | Технология |
|-----------|-----------|
| Desktop framework | Wails v2 |
| Backend | Go 1.23+ |
| Frontend framework | React 18+ |
| Язык фронтенда | TypeScript |
| State management | Zustand |
| UI библиотека | MUI (Material UI) v6 |
| Сборщик | Vite |
| Шрифт | Inter |

---

# Часть I: UI/UX Спецификация

## 1. Overview

### 1.1 Purpose

Quillet — desktop P2P мессенджер, ориентированный на приватность и прямую коммуникацию. Использует криптографические ключевые пары для идентификации пользователей и устанавливает прямые P2P соединения.

### 1.2 Target Audience

- Privacy-conscious пользователи
- Технически грамотные пользователи, комфортно работающие с криптографической идентичностью
- Desktop пользователи (Windows, macOS, Linux)

### 1.3 Key Success Metrics

| Metric | Target |
|---|---|
| Time to first message sent | < 3 minutes (including onboarding) |
| Message send latency (UI response) | < 200ms |
| Onboarding completion rate | > 90% |
| Application startup time | < 2 seconds |

### 1.4 Scope

**MVP (v1.0):** Генерация ключевой пары, 1-on-1 текст, управление контактами, статус online/offline, светлая/тёмная тема, system tray.

**Future (v2.0+):** Групповые чаты, файлы, голос/видео (WebRTC), поиск, реакции.

---

## 2. Use Cases

### UC-001: First Launch / Onboarding

- **Actor:** Новый пользователь
- **Main Flow:**
  1. Запуск → экран приветствия с описанием P2P идентичности
  2. Ввод display name (обязательно) + аватар (опционально)
  3. "Generate Identity" → генерация Ed25519 ключевой пары
  4. Показ публичного ID (16 hex символов SHA-256 хэша) с кнопкой копирования
  5. Сохранение ключа локально (опционально зашифрован парольной фразой)
  6. Переход на главный экран
- **Alternative:** "Import Existing Identity" — вставка приватного ключа или загрузка файла
- **Business Rules:** Display name 1-64 символа; Ed25519 ключи; Public ID = первые 16 символов hex(SHA-256(publicKey))

### UC-002: Add Contact

- **Main Flow:** FAB "+" → диалог → вставить Public ID (16 hex) или полный ключ (64 hex) → опциональное имя → "Add" → валидация → контакт в списке → попытка P2P соединения
- **Errors:** невалидный формат, дубликат, добавление себя

### UC-003: Send Message

- **Main Flow:** Выбор контакта → ввод текста → Enter/кнопка → сообщение со статусом "Sending" (часы) → "Sent" (✓) → "Read" (✓✓ primary)
- **Alternatives:** Shift+Enter = перенос; офлайн = очередь; ошибка = "Failed" + retry
- **Business Rules:** пустые не отправляются; max 4096 символов; E2E шифрование

### UC-004: Manage Profile Settings

- **Main Flow:** Иконка настроек → панель настроек → смена имени, аватара, копирование ID, экспорт ключа, тема, уведомления → auto-save

### UC-005: Delete/Block Contact

- **Main Flow:** ПКМ на контакт → контекстное меню → "Delete"/"Block" → подтверждение → действие
- Delete: удаляет контакт + историю
- Block: блокирует + разрыв соединения, разблокировка в настройках

---

## 3. Information Architecture

### 3.1 Screen Map

```
Quillet
├── Onboarding (первый запуск)
│   ├── Welcome Screen
│   ├── Identity Setup (name + avatar)
│   ├── Identity Created (show public ID)
│   └── [Import Identity]
│
├── Main Application
│   ├── Sidebar (persistent left panel)
│   │   ├── User Profile Header
│   │   ├── Search Bar
│   │   ├── Chat List
│   │   └── Add Contact FAB
│   │
│   └── Content Area (right panel)
│       ├── Empty State (no chat selected)
│       ├── Chat View (header + messages + input)
│       ├── Settings View
│       └── Add Contact Dialog (overlay)
│
└── System Tray (Show/Hide, Quit)
```

### 3.2 Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + N` | Add contact |
| `Cmd/Ctrl + F` | Focus search |
| `Cmd/Ctrl + ,` | Settings |
| `Cmd/Ctrl + 1-9` | Switch to nth chat |
| `Esc` | Close dialog / clear search |
| `Enter` | Send message |
| `Shift+Enter` | New line |

### 3.3 Responsive Behavior

- Минимальный размер окна: **800 × 560 px**
- Sidebar: resizable 240-400px, default 320px (280px при узком окне)
- Content Area: flex, заполняет оставшееся

---

## 4. UI Specification

### 4.1 Design Tokens

#### Color Palette — Light Theme

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#00897B` | Primary actions (Teal 600) |
| `--color-primary-light` | `#4DB6AC` | Hover (Teal 300) |
| `--color-primary-dark` | `#00695C` | Pressed (Teal 800) |
| `--color-primary-surface` | `#E0F2F1` | Primary backgrounds (Teal 50) |
| `--color-on-primary` | `#FFFFFF` | Text on primary |
| `--color-secondary` | `#546E7A` | Secondary text (Blue Grey 600) |
| `--color-accent` | `#FF6D00` | Badges, urgent (Orange A700) |
| `--color-background` | `#FFFFFF` | Main background |
| `--color-surface` | `#F5F5F5` | Sidebar (Grey 100) |
| `--color-surface-variant` | `#EEEEEE` | Hover (Grey 200) |
| `--color-text-primary` | `#212121` | Main text (Grey 900) |
| `--color-text-secondary` | `#757575` | Hints, timestamps (Grey 600) |
| `--color-text-disabled` | `#BDBDBD` | Disabled (Grey 400) |
| `--color-divider` | `#E0E0E0` | Separators (Grey 300) |
| `--color-message-own` | `#E0F2F1` | Own message bubble (Teal 50) |
| `--color-message-other` | `#FFFFFF` | Other's bubble |
| `--color-success` | `#43A047` | Online (Green 600) |
| `--color-warning` | `#FB8C00` | Connecting (Orange 600) |
| `--color-error` | `#E53935` | Errors (Red 600) |

#### Color Palette — Dark Theme

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#4DB6AC` | Primary (Teal 300) |
| `--color-primary-light` | `#80CBC4` | Hover (Teal 200) |
| `--color-primary-dark` | `#00897B` | Pressed (Teal 600) |
| `--color-primary-surface` | `#1A3735` | Primary backgrounds |
| `--color-accent` | `#FFAB40` | Badges (Orange A200) |
| `--color-background` | `#121212` | Main background |
| `--color-surface` | `#1E1E1E` | Sidebar |
| `--color-surface-variant` | `#2C2C2C` | Hover |
| `--color-text-primary` | `#E0E0E0` | Main text |
| `--color-text-secondary` | `#9E9E9E` | Hints |
| `--color-divider` | `#333333` | Separators |
| `--color-message-own` | `#1A3735` | Own bubble |
| `--color-message-other` | `#2C2C2C` | Other's bubble |
| `--color-success` | `#66BB6A` | Online (Green 400) |
| `--color-error` | `#EF5350` | Errors (Red 400) |

#### Typography

Font: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `h1` | 24px | 600 | 32px | Page titles |
| `h2` | 20px | 600 | 28px | Section headers |
| `h3` | 16px | 600 | 24px | Contact names |
| `body` | 14px | 400 | 20px | Messages, body |
| `body-medium` | 14px | 500 | 20px | Emphasized body |
| `caption` | 12px | 400 | 16px | Timestamps, hints |
| `caption-medium` | 12px | 500 | 16px | Badges, labels |
| `button` | 14px | 500 | 20px | Buttons |
| `overline` | 10px | 600 | 16px | Labels (uppercase) |

#### Spacing Scale (base: 4px)

`space-1`=4px, `space-2`=8px, `space-3`=12px, `space-4`=16px, `space-5`=20px, `space-6`=24px, `space-8`=32px, `space-10`=40px

#### Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-xs` | 4px | Chips |
| `radius-sm` | 8px | Inputs, small cards |
| `radius-md` | 12px | Cards, panels |
| `radius-lg` | 16px | Message bubbles, dialogs |
| `radius-xl` | 20px | Large modals |
| `radius-full` | 9999px | Avatars, pills |

#### Shadows

| Token | Usage |
|---|---|
| `shadow-1` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` — inputs, cards |
| `shadow-2` | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` — dropdowns |
| `shadow-3` | `0 10px 20px rgba(0,0,0,0.10), 0 3px 6px rgba(0,0,0,0.08)` — dialogs |

Dark theme: alpha × 2.5.

#### Animations

| Token | Value | Usage |
|---|---|---|
| `transition-fast` | 100ms ease-out | Hover, active |
| `transition-normal` | 200ms ease-out | State changes |
| `transition-slow` | 300ms ease-in-out | Panel transitions |
| `transition-spring` | 400ms cubic-bezier(0.34,1.56,0.64,1) | Message appear |

---

### 4.2 Components (14 штук)

#### 4.2.1 Avatar

- MUI `Avatar` с кастомизацией
- Variants: `image`, `initials`, `placeholder`
- Sizes: small=32px, medium=40px, large=48px, xlarge=80px
- Status dot: 10px circle bottom-right с 2px border matching parent background
  - Online: `--color-success`; Offline: `--color-text-disabled`; Connecting: `--color-warning` (pulsing)
- Initials color: deterministic из publicID hash, 8 цветов: `#E53935, #8E24AA, #3949AB, #1E88E5, #00897B, #43A047, #FB8C00, #6D4C41`. Формула: `colors[hashCode(publicID) % 8]`. Text white.

#### 4.2.2 Button

- MUI `Button` + `IconButton`
- Variants: `primary` (contained), `secondary` (outlined), `ghost` (text), `danger` (contained error), `icon` (IconButton)
- Sizes: small=32px, medium=40px, large=48px
- States: default, hover (ripple + lighten 8%), active (darken 4%), focus (2px outline ring), disabled (40% opacity), loading (spinner, width preserved)

#### 4.2.3 TextField

- MUI `TextField` — `outlined` (forms), `filled` (search)
- States: default (divider border) → hover (secondary border) → focus (primary 2px) → error (error 2px) → disabled (40%)
- Features: leading/trailing icons, helper text, character counter

#### 4.2.4 MessageInput

- Custom: MUI TextField multiline (`minRows=1`, `maxRows=6`) + IconButton Send
- Layout: `[TextArea (flex: 1)] [SendButton (48px)]`
- Auto-grows 1-6 строк, scrollable после
- Send disabled при пустом вводе; enabled — `--color-primary`
- Enter = send, Shift+Enter = newline, Cmd/Ctrl+Enter = send
- Placeholder: "Write a message..."
- Draft сохраняется per contact в React state

#### 4.2.5 MessageBubble

- Custom component (MUI Paper base)
- Outgoing: right-aligned, `--color-message-own`, tail bottom-right 4px
- Incoming: left-aligned, `--color-message-other`, tail bottom-left 4px
- Max width: 65%, min width: 80px; padding: 8px 12px; radius: 16px (except tail corner 4px)
- Metadata: timestamp (`caption`) + status icon (outgoing only)
- **Delivery status icons:**
  - `sending`: Clock spinning 2s, `--color-text-disabled`
  - `sent`: Single check, `--color-text-secondary`
  - `delivered`: Double check, `--color-text-secondary`
  - `read`: Double check, `--color-primary`
  - `failed`: Error circle `--color-error`, entire bubble clickable for retry
- **Message grouping:** Same sender < 60s → group. First has tail, subsequent no tail + 4px gap (vs 8px). Last carries timestamp.
- **Time separator:** Gap > 15 min → DateDivider
- **Context menu:** "Copy text", "Delete" (separator between)
- Failed: red tint 8% overlay, error icon, "Failed to send. Click to retry."

#### 4.2.6 ChatListItem

- MUI `ListItemButton`, 72px height
- Layout: `[Avatar 40px + status] [12px gap] [Name + LastMsg flex:1] [Time + Badge]`
- Name: `h3`, single line, ellipsis
- Last message: `caption`, single line, ellipsis; own prefixed "You: " (`caption-medium`)
- Time format: "12:31 PM" (today), "Tue" (this week), "Jan 15" (this year), "15.01.25" (older)
- States: default (transparent), hover (`surface-variant`), selected (`primary-surface` + 3px left border `primary`)
- Unread badge: `radius-full`, `accent` bg, white text, `caption-medium`, min 20px, max "99+"
- Context menu: "Mark as read/unread", separator, "Delete chat" (danger), "Block contact" (danger)

#### 4.2.7 Sidebar

- Layout (top to bottom):
  1. **Profile Header** (64px): Avatar large + Name/Status + Settings IconButton. Drag region for Wails.
  2. **Search Bar** (48px): TextField filled, SearchIcon leading, ClearIcon trailing (when text). Debounce 300ms.
  3. **Chat List** (flex, scrollable): ChatListItem list, sorted by last msg time. Virtual scroll > 50 items. Thin scrollbar 6px.
  4. **Add Contact FAB**: MUI Fab primary medium (48px), AddIcon, bottom-right absolute, shadow-2.
- Resizer: 4px drag handle right edge, cursor col-resize, 240-400px, double-click reset 320px.
- Background: `--color-surface`, right border 1px `--color-divider`

#### 4.2.8 ChatHeader

- 64px height, horizontal flex
- Left: Avatar medium + Column(Name `h3`, Status text `caption`)
- Right: MoreVert IconButton → Menu: "Clear history", "Block contact"
- **Status text variants:**
  - Online: "online" `--color-success`
  - Offline: "last seen {relative}" `--color-text-secondary`
  - Typing: "typing..." `--color-primary` (animated ellipsis 1.5s)
  - Connecting: "connecting..." `--color-warning` (animated ellipsis)
- Relative time: < 1min "just now", < 60min "{n} min ago", < 24h "{n}h ago", < 7d "{weekday} at {time}", older "{date} at {time}"

#### 4.2.9 DateDivider

- Centered text with horizontal lines: `-------- January 28, 2026 --------`
- Text: `caption-medium`, `text-secondary`. Lines: 1px `divider`.
- Format: "Today", "Yesterday", day name (this week), "15 January" (this year), "15 January 2025" (older)

#### 4.2.10 EmptyState

- 4 variants:
  - `no-chats`: Chat bubbles illustration + "No conversations yet" + "Add a contact to start chatting" + "Add Contact" CTA
  - `no-chat-selected`: Quillet logo 80px + "Quillet" h1 + "Select a chat or start a new conversation"
  - `empty-chat`: Wave hand 64px + "Start of your conversation with {name}" + "Send a message to begin"
  - `no-search-results`: SearchOff icon + "No results" + "Try a different search query"
- Layout: flex column, centered, max-width 320px

#### 4.2.11 Dialog

- MUI `Dialog` maxWidth="sm" (480px), radius-xl (20px), padding 24px, shadow-3
- Structure: DialogTitle (h2) + DialogContent (body) + DialogActions (right-aligned, gap 12px)
- Specific: Confirm Delete Chat, Confirm Block Contact (both with Cancel ghost + action danger)

#### 4.2.12 Toast / Snackbar

- MUI `Snackbar` + `Alert`, bottom-center, 24px from bottom
- Auto-dismiss 4s. Max 1 toast.
- Use cases: "Public ID copied" (success), "Contact added" (success), "Message failed" (error + "Retry"), etc.

#### 4.2.13 ConnectionStatusBar

- Full-width bar 36px above message area, below chat header
- `connecting`: warning 15% bg, SyncIcon spinning, "Connecting..."
- `disconnected`: error 15% bg, CloudOffIcon, "Connection lost. Reconnecting..." + "Retry"
- `connected`: success 15% bg, CloudDoneIcon, "Connected" — auto-hides 2s
- Animation: slide down 200ms appear, slide up 200ms disappear

#### 4.2.14 ContextMenu

- MUI `Menu` с `anchorPosition`. Background, shadow-3, radius-sm, min-width 180px
- Items: 36px height, 6px 16px padding, optional leading icon 20px
- Destructive items: text + icon in `--color-error`
- Separator: MUI Divider 1px

---

### 4.3 Screens

#### Screen: Onboarding — Welcome

Full-window, centered, max-width 480px:
1. Quillet logo 64px `--color-primary`
2. "Quillet" `h1`
3. "Private peer-to-peer messaging" `body`, `text-secondary`
4. Description paragraph about crypto identity
5. "Create New Identity" — Button primary large full-width
6. "Import Existing Identity" — Button ghost large full-width

#### Screen: Onboarding — Setup

Full-window, centered, max-width 480px:
1. Back button top-left
2. "Create Your Identity" `h1`
3. Avatar picker 80px (clickable circle, file picker JPEG/PNG/WebP max 2MB)
4. Display Name TextField large (required, 1-64 chars, auto-focus)
5. Passphrase TextField password (optional, min 4 chars, visibility toggle)
6. Confirm Passphrase (appears when passphrase ≥ 4 chars, animated slide-down)
7. "Generate Identity" — Button primary large (disabled until valid, loading state)

#### Screen: Onboarding — Identity Created

Full-window, centered, max-width 480px:
1. Success checkmark animation (green circle, scale bounce)
2. "Your Identity is Ready" `h1`
3. Public ID card: Paper, overline label, monospace `XXXX XXXX XXXX XXXX`, copy button, helper text
4. "Start Chatting" — Button primary large

#### Screen: Onboarding — Import

Full-window, centered, max-width 480px:
1. Back button
2. "Import Identity" `h1`
3. Key input: TextField multiline 4 rows, monospace, placeholder "Paste private key here..."
4. "Or browse for key file" — Button secondary
5. Passphrase field (appears if encrypted key detected)
6. "Import" — Button primary large

#### Screen: Main Layout

Two-column: Title Bar (32px, custom frameless, draggable) → Sidebar (320px) + Content Area (flex:1).
- macOS: native traffic lights left
- Windows/Linux: custom controls right
- Close = minimize to tray (first time shows toast)
- System tray: icon with unread dot, menu Show/Hide + Quit

#### Screen: Chat View

Vertical flex in content area:
1. **ChatHeader** (64px)
2. **ConnectionStatusBar** (36px, conditional)
3. **MessageArea** (flex:1, scrollable):
   - Max content width 960px centered
   - Messages chronological (oldest top)
   - 8px gap between messages, 4px within groups
   - DateDividers between days
   - Typing indicator: 3 animated dots left-aligned
   - Auto-scroll when at bottom; "Scroll to bottom" FAB when scrolled up (with unread badge)
   - Loading older: CircularProgress at top on scroll-up, 50 messages per page
   - States: Loading (5-7 skeleton bubbles), Empty (EmptyState), Error (retry), Normal, Typing
   - Animations: outgoing slide-up 200ms, incoming fade-in + slide-left 200ms
4. **MessageInput** (40-140px)

#### Screen: Settings View

Scrollable, max-width 640px centered, padding 32px:
1. Back arrow + "Settings" h1
2. **Profile**: Avatar xlarge (80px, editable) + inline-editable display name + Public ID monospace + copy
3. **Appearance**: Theme ToggleButtonGroup (Light/Dark/System)
4. **Notifications**: Switches — Enable notifications, Sound, Message preview
5. **Privacy & Security**: Export Private Key, Change Passphrase, Blocked Contacts list with Unblock
6. **About**: Version, build info

#### Screen: Add Contact Dialog

MUI Dialog overlay:
- Title: "Add Contact"
- Public ID field: TextField with paste icon, validation (empty, wrong format, self, duplicate)
- Name field: optional, max 64
- Actions: Cancel (ghost) + Add (primary, disabled until valid, loading state)

---

## 5. Backend API (Wails Bindings)

### 5.1 TypeScript Types

```typescript
interface Identity {
  publicID: string;       // 16 hex chars
  publicKey: string;      // 64 hex chars
  displayName: string;
  avatarPath: string;
  createdAt: number;      // Unix ms
}

interface Contact {
  publicID: string;
  publicKey: string;
  displayName: string;
  avatarPath: string;
  isOnline: boolean;
  isBlocked: boolean;
  lastSeen: number;
  addedAt: number;
}

interface Message {
  id: string;             // UUID v4
  chatID: string;         // Contact's publicID
  senderID: string;
  content: string;        // 1-4096 chars
  timestamp: number;      // Unix ms
  status: MessageStatus;
}

enum MessageStatus {
  Sending = "sending",
  Sent = "sent",
  Delivered = "delivered",
  Read = "read",
  Failed = "failed",
}

interface ChatSummary {
  contactID: string;
  contact: Contact;
  lastMessage: Message | null;
  unreadCount: number;
}

interface ConnectionState {
  contactID: string;
  state: "connected" | "connecting" | "disconnected";
}

interface Settings {
  theme: "light" | "dark" | "system";
  notificationsOn: boolean;
  soundOn: boolean;
  showMessagePreview: boolean;
  sidebarWidth: number;
}
```

### 5.2 Bound Functions (Go → Frontend)

**Identity:**
- `CreateIdentity(displayName, passphrase, avatarPath) → Identity`
- `ImportIdentity(privateKeyHex, passphrase) → Identity`
- `GetIdentity() → Identity`
- `UpdateProfile(displayName, avatarPath) → error`
- `ExportPrivateKey(passphrase) → string`
- `ChangePassphrase(old, new) → error`
- `HasPassphrase() → bool`

**Contacts:**
- `AddContact(publicIDOrKey, displayName) → Contact`
- `GetContacts() → []Contact`
- `GetContact(publicID) → Contact`
- `UpdateContact(publicID, displayName) → error`
- `DeleteContact(publicID) → error`
- `BlockContact(publicID) → error`
- `UnblockContact(publicID) → error`
- `GetBlockedContacts() → []Contact`

**Messaging:**
- `SendMessage(contactID, content) → Message`
- `GetMessages(contactID, before, limit) → []Message`
- `GetChatSummaries() → []ChatSummary`
- `MarkAsRead(contactID) → error`
- `RetryMessage(messageID) → Message`
- `DeleteMessage(messageID) → error`

**Settings:**
- `GetSettings() → Settings`
- `UpdateSettings(settings) → error`

### 5.3 Events (Backend → Frontend)

| Event | Payload | Описание |
|---|---|---|
| `message:received` | `Message` | Новое входящее сообщение |
| `message:status` | `{messageID, status}` | Статус доставки |
| `contact:status` | `{contactID, isOnline, lastSeen}` | Online/offline |
| `contact:typing` | `{contactID, isTyping}` | Typing indicator |
| `contact:updated` | `{contactID, displayName, avatarPath}` | Профиль контакта обновлён |
| `connection:state` | `ConnectionState` | P2P состояние |
| `settings:changed` | `Settings` | Настройки изменены |

---

## 6. Data Model

### 6.1 Entities

**Identity** (singleton): publicID, publicKey (Ed25519 32 bytes), privateKey (64 bytes, encrypted), displayName (1-64), avatarPath, passphraseHash (Argon2id), createdAt.

**Contact**: publicID (PK, 16 hex), publicKey (32 bytes), displayName (1-64), avatarData (max 2MB), isBlocked (default false), lastSeen, addedAt.

**Message**: id (UUID PK), chatID (FK→Contact.publicID), senderID, content (1-4096), timestamp, status (sending|sent|delivered|read|failed).

**Settings**: key-value store (theme, notificationsOn, soundOn, showMessagePreview, sidebarWidth).

### 6.2 Storage

**SQLite 3** (embedded, `modernc.org/sqlite` или `mattn/go-sqlite3`)

Location: `~/Library/Application Support/Quillet/` (macOS), `%APPDATA%\Quillet\` (Windows), `~/.config/quillet/` (Linux)

Files:
- `quillet.db` — SQLite (contacts, messages, settings)
- `identity.key` — Зашифрованный приватный ключ (Argon2id + XChaCha20-Poly1305)
- `avatars/` — Файлы аватаров по publicID

```sql
CREATE TABLE contacts (
    public_id TEXT PRIMARY KEY, public_key BLOB NOT NULL,
    display_name TEXT NOT NULL, avatar_data BLOB,
    is_blocked INTEGER NOT NULL DEFAULT 0,
    last_seen INTEGER NOT NULL DEFAULT 0, added_at INTEGER NOT NULL
);
CREATE TABLE messages (
    id TEXT PRIMARY KEY, chat_id TEXT NOT NULL REFERENCES contacts(public_id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL, content TEXT NOT NULL,
    timestamp INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'sending',
    CHECK (status IN ('sending','sent','delivered','read','failed'))
);
CREATE INDEX idx_messages_chat_time ON messages(chat_id, timestamp DESC);
CREATE INDEX idx_messages_chat_status ON messages(chat_id, status);
CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
```

---

## 7. Non-functional Requirements

### Performance

| Metric | Target |
|---|---|
| Cold startup | < 2s |
| Message send (UI) | < 100ms (optimistic update) |
| Chat list rendering (100 items) | < 16ms (60fps, virtual scroll) |
| Message history load (50 msgs) | < 200ms |
| Memory idle | < 100MB |
| Theme switch | < 100ms |

### Security

- Private key: encrypted at rest (Argon2id + XChaCha20-Poly1305)
- Messages: NaCl box (Curve25519 + XSalsa20-Poly1305), per-message nonce
- Zero telemetry, zero external HTTP requests
- Input validation: frontend + backend
- Secrets never in logs

### Accessibility

- WCAG 2.1 Level AA
- Color contrast ≥ 4.5:1 (normal text), ≥ 3:1 (large/UI)
- Full keyboard navigation, visible focus ring
- Semantic HTML, ARIA landmarks/roles/live regions
- `prefers-reduced-motion` support
- Min click target: 44×44px

### Platform Support

- macOS 11+, Windows 10 (1809+), Linux (Ubuntu 20.04+)
- Window: min 800×560, default 1200×800, remember position/size
- Frameless (custom title bar), single instance, system tray
- Close = minimize to tray

---

## 8. Prioritization

### MVP (v1.0) — обязательно

- Onboarding: генерация ключей, display name, аватар, парольная фраза
- Контакты: добавление/удаление/блокировка по Public ID
- Чат 1-на-1: текст, статусы доставки (sending/sent/failed), группировка, DateDividers
- Sidebar: профиль, поиск, список чатов с превью/бейджами, FAB
- Chat View: header, сообщения, ввод, ConnectionStatusBar
- Темы: light + dark + system
- System tray
- Keyboard shortcuts (core set)
- Empty states (4 варианта)
- Базовая a11y (keyboard, focus ring, semantic HTML, ARIA, contrast)

### Nice to Have (v1.1)

- Read receipts (delivered + read)
- Typing indicator
- Пагинация истории (lazy load по 50)
- Retry failed messages
- Import/Export identity
- Resizable sidebar
- Анимации сообщений
- `prefers-reduced-motion`
- Single instance enforcement

### Future (v2.0+)

- Групповые чаты
- Файлы, изображения
- Голос/видео (WebRTC)
- Реакции, reply, forward, pin
- Поиск по сообщениям
- Markdown форматирование
- SQLCipher
- Multi-device sync
- Mobile companion
- i18n, RTL

---

## 9. React Component Tree + File Structure

### Component Tree

```
<App>
  <ThemeProvider>
    <CssBaseline />
    <ToastProvider>
      {!hasIdentity && <OnboardingFlow />}
      {needsUnlock && <UnlockScreen />}
      {hasIdentity && !needsUnlock && (
        <MainLayout>
          <TitleBar />
          <Box display="flex">
            <Sidebar>
              <SidebarHeader />     {/* Avatar + name + settings */}
              <SearchBar />
              <ChatList>
                <ChatListItem />*
                <EmptyState variant="no-chats|no-search-results" />
              </ChatList>
              <AddContactFAB />
            </Sidebar>
            <SidebarResizeHandle />
            <ContentArea>
              <EmptyState variant="no-chat-selected" />
              {/* OR */}
              <ChatView>
                <ChatHeader />
                <ConnectionStatusBar />
                <MessageArea>
                  <DateDivider />*
                  <MessageBubble />*
                  <TypingIndicator />
                </MessageArea>
                <ScrollToBottomFAB />
                <MessageInput />
              </ChatView>
              {/* OR */}
              <SettingsView />
            </ContentArea>
          </Box>
          <AddContactDialog />
          <ConfirmDialog />
          <ContextMenu />
        </MainLayout>
      )}
      <ToastContainer />
    </ToastProvider>
  </ThemeProvider>
</App>
```

### File Structure

```
frontend/src/
├── main.tsx
├── App.tsx
├── theme/
│   ├── index.ts              # createTheme(), exports
│   ├── tokens.ts             # spacing, radius, shadows
│   ├── light.ts              # light palette
│   ├── dark.ts               # dark palette
│   ├── typography.ts
│   ├── components.ts         # MUI component overrides
│   └── ThemeProvider.tsx      # context, toggle, system detection
├── types/
│   ├── index.ts, identity.ts, contact.ts, message.ts, chat.ts, settings.ts, connection.ts
├── store/
│   ├── useIdentityStore.ts, useContactsStore.ts, useMessagesStore.ts
│   ├── useChatSummariesStore.ts, useSettingsStore.ts, useConnectionStore.ts, useUIStore.ts
├── hooks/
│   ├── useWailsEvents.ts, useKeyboardShortcuts.ts, useAutoScroll.ts
│   ├── useVirtualScroll.ts, useDraft.ts, useSystemTheme.ts, useWindowControls.ts
├── services/
│   ├── api.ts                # type-safe wrappers over Wails bindings
│   ├── events.ts             # event subscription helpers
│   └── notifications.ts      # system notification wrapper
├── utils/
│   ├── formatDate.ts, formatPublicID.ts, clipboard.ts
│   ├── messageGrouping.ts, validation.ts, avatarColor.ts
└── components/
    ├── ui/           Avatar, EmptyState, ConfirmDialog, ContextMenu, ConnectionStatusBar, Spinner
    ├── layout/       TitleBar, MainLayout, ContentArea, SidebarResizeHandle
    ├── sidebar/      Sidebar, SidebarHeader, SearchBar, ChatList, ChatListItem, AddContactFAB
    ├── chat/         ChatView, ChatHeader, MessageArea, MessageBubble, MessageInput,
    │                 DateDivider, TypingIndicator, ScrollToBottomFAB, MessageStatus
    ├── settings/     SettingsView, ProfileSection, AppearanceSection, NotificationsSection,
    │                 SecuritySection, AboutSection
    ├── onboarding/   OnboardingFlow, WelcomeScreen, SetupScreen, IdentityCreatedScreen,
    │                 ImportScreen, UnlockScreen
    └── dialogs/      AddContactDialog
```

---

## 10. Visual Reference

### Main Layout — No Chat Selected (Light)

```
+========================================================================+
| [=] Quillet                                          [_] [O] [X]       |
|========================================================================|
| +----[Sidebar]--------+ | +----------[Content Area]----------------+  |
| | [Av] Sergey K.   [S]| | |                                        |  |
| |   Online             | | |                                        |  |
| |----------------------| | |                                        |  |
| | [Q] Search...       | | |         +---[Logo]---+                 |  |
| |----------------------| | |         |  Quillet   |                 |  |
| | [Av] Alice     2m   | | |         +------------+                 |  |
| |  Hey, how are y (3) | | |                                        |  |
| |______________________| | |   Select a chat or start a new         |  |
| | [Av] Bob       1h   | | |          conversation                  |  |
| |  > You: Thanks!     | | |                                        |  |
| |______________________| | |                                        |  |
| | [Av] Charlie  Tue   | | |                                        |  |
| |  See you tomorrow   | | |                                        |  |
| |                 [+]  | | |                                        |  |
| +----------------------+ | +----------------------------------------+  |
+========================================================================+
```

### Chat View — Active Conversation (Light)

```
+========================================================================+
| [=] Quillet                                          [_] [O] [X]       |
|========================================================================|
| +----[Sidebar]--------+ | +----------[Content Area]----------------+  |
| | [Av] Sergey K.   [S]| | | [Av] Alice        online          [:]  |  |
| |   Online             | | |____________________________________________|
| |----------------------| | |  [!] Connecting...                     |  |
| | [Q] Search...       | | |________________________________________|  |
| |----------------------| | |       ---- January 28, 2026 ----       |  |
| | [Av] Alice     2m   | | |  .-------------------.                 |  |
| |  Hey, how are y (3) | | |  | Hey, how are you? |                 |  |
| |*SELECTED*____________| | |  |          12:30 PM |                 |  |
| | [Av] Bob       1h   | | |  '-------------------'                 |  |
| |  > You: Thanks!     | | |                 .----------------------.  |
| |______________________| | |                 | I'm good, thanks!   |  |
| | [Av] Charlie  Tue   | | |                 |       12:31 PM  vv  |  |
| |  See you tomorrow   | | |                 '----------------------'  |
| |______________________| | |                 .----------------------.  |
| |                      | | |                 | What about you?     |  |
| |                      | | |                 |       12:31 PM  vv  |  |
| |                      | | |                 '----------------------'  |
| |                      | | |  Alice is typing...                    |  |
| |                 [+]  | | | Write a message...               [>]  |  |
| +----------------------+ | +----------------------------------------+  |
+========================================================================+

Outgoing: right-aligned, teal-50 bg    vv = Read (primary teal)
Incoming: left-aligned, white bg        v = Sent (grey)
*SELECTED* = primary-surface bg + left border
```

### Message Bubble Anatomy

```
OUTGOING (right):                    INCOMING (left):
         .-------------------------.  .-------------------------.
         | Message text            |  | Message text            |
         |           12:31 PM  vv  |  |          12:30 PM      |
         '------------------------+'  +-------------------------'
                                  ^   ^
                              tail    tail
Max width: 65%  |  Radius: 16px (4px on tail corner)
Grouped: no tail, 4px gap (vs 8px normal)

Status: [o]=sending(clock) [v]=sent [vv]=delivered [VV]=read(primary) [!]=failed(error)
```

### Onboarding Welcome

```
    +--------------------------------------------------+
    |               .----[Logo]----.                   |
    |               |   Quillet    |                   |
    |               '--------------'                   |
    |         Private peer-to-peer messaging           |
    |     Your identity is a cryptographic key pair.   |
    |     No phone number, no email, no servers.       |
    |     +--------------------------------------+     |
    |     |        Create New Identity           |     |
    |     +--------------------------------------+     |
    |     +--------------------------------------+     |
    |     |       Import Existing Identity       |     |
    |     +--------------------------------------+     |
    +--------------------------------------------------+
```

### Settings View

```
+----------[Content Area]--------------------------------------+
|   [<] Settings                                               |
|   +-[Profile]----------------------------------------------+ |
|   |   [Avatar 80px] [Edit]  Sergey Kanaev          [pen]   | |
|   |   Public ID: a1b2c3d4e5f67890                 [copy]   | |
|   +-[Appearance]-------------------------------------------+ |
|   |   Theme:   [ Light | *Dark* | System ]                 | |
|   +-[Notifications]----------------------------------------+ |
|   |   Enable notifications          [====O]                | |
|   |   Notification sound             [====O]                | |
|   |   Show message preview           [====O]                | |
|   +-[Privacy & Security]-----------------------------------+ |
|   |   [Export Private Key]  [Change Passphrase]            | |
|   |   Blocked (2): [Av] User1 [Unblock] [Av] User2 [Unblock]|
|   +-[About]------------------------------------------------+ |
|   |   Quillet v1.0.0                                        | |
+--------------------------------------------------------------+
```

---

# Часть II: Техническая Архитектура

## Структура проекта

```
quillet/
├── main.go                         # Точка входа
├── app.go                          # Wails App struct, lifecycle hooks
├── bindings.go                     # Публичные методы для фронтенда
├── events.go                       # Константы Wails Events
├── wails.json / go.mod / go.sum
│
├── internal/
│   ├── domain/                     # Доменные модели
│   │   ├── user.go, contact.go, message.go, conversation.go, connection.go
│   ├── messenger/
│   │   └── messenger.go            # Интерфейс Messenger
│   └── stub/
│       ├── messenger.go            # StubMessenger (in-memory)
│       ├── data.go                 # Тестовые данные
│       └── delay.go                # Имитация задержек
│
├── build/
│
└── frontend/                       # React + TypeScript (Vite)
    ├── src/                        # (см. файловую структуру в разделе 9)
    └── wailsjs/                    # AUTO-GENERATED
```

## Go Messenger Interface

```go
type Messenger interface {
    GetProfile(ctx context.Context) (*domain.User, error)
    UpdateProfile(ctx context.Context, displayName string) error
    GetContacts(ctx context.Context) ([]domain.Contact, error)
    AddContact(ctx context.Context, publicID string) (*domain.Contact, error)
    RemoveContact(ctx context.Context, contactID string) error
    GetConversations(ctx context.Context) ([]domain.Conversation, error)
    GetOrCreateConversation(ctx context.Context, contactID string) (*domain.Conversation, error)
    SendMessage(ctx context.Context, conversationID, content string) (*domain.Message, error)
    GetMessages(ctx context.Context, conversationID string, limit int, beforeID string) ([]domain.Message, error)
    MarkAsRead(ctx context.Context, conversationID string) error
    ConnectionStatus() domain.ConnectionStatus
    OnNewMessage(fn func(msg domain.Message))
    OnContactStatusChanged(fn func(contactID string, status domain.ContactStatus))
    OnConnectionStatusChanged(fn func(status domain.ConnectionStatus))
}
```

**Заглушка (StubMessenger):** in-memory, sync.RWMutex, имитация задержек 100-500ms, автоответы 1-2s, периодическая смена статусов. Тестовые данные: 3-5 контактов с историей.

## Wails Bindings

`App` struct с `messenger.Messenger`. `startup()` регистрирует callbacks → `runtime.EventsEmit`. `bindings.go` — тонкие обёртки.

## Frontend State: Zustand

7 stores: `useIdentityStore`, `useContactsStore`, `useMessagesStore`, `useChatSummariesStore`, `useSettingsStore`, `useConnectionStore`, `useUIStore`.

`useWailsEvents` hook подписывается на все события в `App.tsx`.

## Поток данных

```
UI Action → Zustand action → services/api.ts → Wails Binding → App → Messenger → StubMessenger
Go Event → callback → runtime.EventsEmit → EventsOn (useWailsEvents) → Zustand update → React re-render
```

---

# Часть III: Порядок реализации

### Этап 1: Скелет проекта
1. `wails init -n quillet -t react-ts`
2. Структура Go-пакетов (`internal/domain`, `internal/messenger`, `internal/stub`)
3. Установка MUI, Zustand, Inter шрифт
4. Базовый `wails.json`, запуск `wails dev`

### Этап 2: Go Backend заглушка
1. Доменные модели
2. Интерфейс Messenger
3. StubMessenger с тестовыми данными
4. app.go, bindings.go, events.go, main.go
5. Проверка: `wails dev` → bindings в `frontend/wailsjs/`

### Этап 3: Frontend — каркас UI
1. MUI тема (light + dark) + design tokens
2. AppLayout (sidebar + main area) + TitleBar
3. Sidebar (статичный) + EmptyState
4. Zustand stores с типами
5. services/api.ts + events.ts

### Этап 4: Контакты
1. ContactList + ChatListItem
2. Подключение к GetContacts/GetChatSummaries
3. SearchBar — локальная фильтрация
4. AddContactDialog

### Этап 5: Чат
1. ChatView + ChatHeader + MessageInput
2. MessageArea + MessageBubble + DateDivider
3. Отправка (оптимистичное обновление)
4. Загрузка истории (GetMessages)
5. Группировка, auto-scroll, ScrollToBottomFAB

### Этап 6: Realtime
1. useWailsEvents — подписка на events
2. Входящие сообщения в реальном времени
3. Обновление статусов контактов
4. Обновление статусов доставки
5. ConnectionStatusBar

### Этап 7: Полировка
1. Onboarding flow (Welcome → Setup → Identity Created)
2. Settings View (все секции)
3. Анимации, пустые состояния, обработка ошибок
4. System tray
5. Keyboard shortcuts

---

# Верификация

1. `wails dev` — приложение запускается, отображается окно
2. Sidebar показывает тестовые контакты из StubMessenger
3. Клик по контакту — открывается чат с историей сообщений
4. Ввод и отправка сообщения — появляется со статусом "sending" → "sent" → "delivered"
5. Через 1-2 секунды приходит автоответ от заглушки
6. Статусы контактов периодически меняются (online/offline)
7. AddContactDialog — добавление нового контакта
8. Переключение тем light/dark
9. `wails build` — собирается бинарник для текущей платформы
