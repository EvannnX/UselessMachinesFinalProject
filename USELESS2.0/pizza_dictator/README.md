# 🍕 The Pizza Dictator v4.0

**Pizzeria Brutalism: A Data Privacy Art Installation**

An interactive digital art piece that satirizes modern surveillance capitalism and authoritarian data collection through the absurd lens of pizza preference verification.

## 🎭 Concept

This installation uses brutalist design, aggressive UX patterns, and invasive biometric authentication to critique how casually we surrender personal data online. Users must complete an increasingly absurd "Culinary Compliance Test" just to express a simple opinion about pineapple on pizza.

## ✨ Features

### 1. **Mandatory Terms of Compliance**
- 10 invasive terms users must accept before proceeding
- Includes consent for:
  - Permanent biometric data recording (face, voice, DNA)
  - Browser history and keystroke monitoring
  - Waiving rights to privacy and legal counsel
  - Acknowledgment that "freedom is a delusion"
  - Post-session surveillance by "THE AUTHORITY"

### 2. **Multi-Stage Biometric Verification**

#### **Stage 1: Loading Screen**
- 5-second initialization with green progress bar
- Status: "INITIALIZING SYSTEM..."

#### **Stage 2: Warning Screen**
- 8-second warning with red progress bar
- Message: "WARNING: INITIATING BIO-METRIC FEATURE ACQUISITION"

#### **Stage 3: Face Verification** (5 Tasks)
1. Center your face
2. Turn slowly left
3. Turn slowly right
4. Tilt head up
5. Open mouth wide

Each task requires 1 second of holding the position. Progress displays as 0-100%.

#### **Stage 4: Voice Authentication**
- User must loudly repeat a random oath, such as:
  - "THE GEOMETRY OF THE SLICE IS SACRED!"
  - "TOMATO IS A FRUIT, BUT PIZZA IS A VEGETABLE!"
- Progress bar fills based on microphone input (approx. 5-6 seconds of speaking required)
- 8-second processing period after completion

#### **Stage 5: The Question**
*"DOES PINEAPPLE BELONG ON PIZZA?"*

### 3. **Enhanced Privacy Alerts**
- Large, centered, flashing "DATA CAPTURED" alerts
- Appears after each biometric collection:
  - FACE CENTER
  - FACE LEFT
  - FACE RIGHT
  - FACE UP
  - FACE MOUTH
  - VOICE PRINT
  - PSYCH PROFILE

### 4. **Dystopian Results**
- **Vote YES**: "POLITICAL ALIGNMENT CONFIRMED"
- **Vote NO**: 
  - Siren sound effect
  - Typewriter animation
  - Message: "STATE POLICE ARE EN ROUTE. DO NOT RESIST."

## 🎨 Design Aesthetic

**Brutalism Meets Digital Authoritarianism**
- Color Palette: Burnt crust black, tomato red, cheese white, basil green
- Typography: Courier New (monospace) for terminal/government feel
- UI: Intentionally aggressive, intrusive, and overwhelming
- Custom red/black scrollbars for Terms of Compliance

## 🛠️ Technical Stack

- **p5.js**: Graphics and canvas manipulation
- **ml5.js**: FaceMesh for facial recognition
- **p5.sound.js**: Audio playback and microphone input
- **Web Speech API**: Text-to-speech for AI voice

## 🔧 技术栈详解（中文）

### 核心技术与引用方法

#### 1. **p5.js** - 图形渲染与画布操作
**用途**：创建画布、处理视频流、绘制图形界面

**引用方式**：
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
```

**主要功能**：
- `createCanvas()` - 创建全屏画布
- `createCapture(VIDEO)` - 获取摄像头视频流
- `background()`, `fill()`, `rect()` - 绘制图形
- `select()` - DOM元素选择器

---

#### 2. **ml5.js** - 机器学习库（FaceMesh面部识别）
**用途**：实时面部关键点检测和追踪

**模型**：MediaPipe FaceMesh（不是YOLO）
- **MediaPipe FaceMesh** 是Google开发的轻量级面部网格模型
- 可检测468个3D面部关键点
- 适用于表情识别、头部姿态估计

**引用方式**：
```html
<script src="https://unpkg.com/ml5@latest/dist/ml5.min.js"></script>
```

**使用示例**：
```javascript
// 初始化FaceMesh模型
faceMesh = ml5.facemesh(video, modelReady);

// 监听预测结果
faceMesh.on('predict', results => {
    faces = results; // 获取面部数据
});

// 访问关键点
const keypoints = faces[0].scaledMesh;
const nose = keypoints[1];        // 鼻尖
const leftCheek = keypoints[234]; // 左脸颊
const rightCheek = keypoints[454]; // 右脸颊
```

**本项目应用**：
- 检测用户是否居中（鼻子相对位置）
- 检测头部左右转动（面部宽度比例）
- 检测头部仰起（鼻子与眼睛的Y轴距离）
- 检测嘴巴张开程度（上下嘴唇距离）

---

#### 3. **p5.sound.js** - 音频处理库
**用途**：背景音乐播放、麦克风输入检测、音效合成

**引用方式**：
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/addons/p5.sound.min.js"></script>
```

**主要功能**：
```javascript
// 加载音频文件
bgMusic = loadSound('assets/processing.mp3');

// 播放与控制
bgMusic.setVolume(0.5);
bgMusic.loop(); // 循环播放

// 麦克风输入
mic = new p5.AudioIn();
mic.start();
let vol = mic.getLevel(); // 获取音量级别 (0.0 - 1.0)

// 音效合成
let osc = new p5.Oscillator('sine');
osc.freq(800); // 设置频率
osc.start();
```

**本项目应用**：
- 播放背景音乐（processing.mp3）
- 监听用户语音输入（检测宣誓音量）
- 合成系统警报音效（不同频率的振荡器）

---

#### 4. **Web Speech API** - 浏览器语音合成
**用途**：AI语音播报、文字转语音（TTS）

**引用方式**：无需引用，浏览器原生支持

**使用示例**：
```javascript
function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // 停止之前的语音
        
        let msg = new SpeechSynthesisUtterance(text);
        msg.rate = 0.9;   // 语速（0.1-10）
        msg.pitch = 0.6;  // 音调（0-2），低音更有"威权感"
        
        // 选择机器人风格的声音
        let voices = window.speechSynthesis.getVoices();
        let robotVoice = voices.find(v => v.name.includes('Google US English'));
        if (robotVoice) msg.voice = robotVoice;
        
        window.speechSynthesis.speak(msg);
    }
}
```

**本项目应用**：
- 播报系统指令（"CENTER YOUR FACE"）
- 播报警告信息（"Warning. Initiating bio-metric feature acquisition."）
- 播报投票问题（"DOES PINEAPPLE BELONG ON PIZZA?"）

---

### 完整引用清单

在 `index.html` 中需要按顺序引用以下库：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>The Pizza Dictator v4.0</title>
    
    <!-- 1. p5.js 核心库 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
    
    <!-- 2. p5.sound 音频扩展 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/addons/p5.sound.min.js"></script>
    
    <!-- 3. ml5.js 机器学习库 -->
    <script src="https://unpkg.com/ml5@latest/dist/ml5.min.js"></script>
    
    <!-- 注意：Web Speech API 无需引用，浏览器原生支持 -->
    
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- HTML内容 -->
    <script src="sketch.js"></script>
</body>
</html>
```

---

### 技术选型说明

**为什么使用 MediaPipe FaceMesh 而不是 YOLO？**

1. **YOLO (You Only Look Once)**：
   - 用于目标检测和边界框定位
   - 适合识别"人在哪里"
   - 不提供面部关键点

2. **MediaPipe FaceMesh**：
   - 专门用于面部网格重建
   - 提供468个精确关键点
   - 可以检测表情、姿态、嘴部状态
   - 更适合本项目的"生物特征验证"需求

**其他替代方案**：
- **face-api.js**：功能更全但更重量级
- **TensorFlow.js + BlazeFace**：更底层，需要更多配置
- **ml5.js FaceMesh**：基于MediaPipe，易用且性能优秀 ✅（本项目选择）

---

### 浏览器兼容性

| 技术 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| p5.js | ✅ | ✅ | ✅ | ✅ |
| ml5.js FaceMesh | ✅ | ✅ | ⚠️ 部分 | ✅ |
| Web Speech API | ✅ | ⚠️ 有限 | ✅ | ✅ |
| MediaDevices (摄像头) | ✅ | ✅ | ✅ | ✅ |

**推荐浏览器**：Chrome 或 Edge（最佳兼容性）

---

### 数据流程图

```
摄像头 → createCapture() → video元素
                               ↓
                          ml5.facemesh()
                               ↓
                      面部关键点数据 (468点)
                               ↓
                   自定义算法分析（头部姿态/表情）
                               ↓
                          触发状态转换
```

```
麦克风 → p5.AudioIn() → getLevel()
                           ↓
                     音量检测 (0.0-1.0)
                           ↓
                    累积进度条 (0-100%)
                           ↓
                      触发语音验证通过
```

## 📁 File Structure

```
pizza_dictator/
├── index.html          # Main HTML structure
├── style.css           # Brutalist styling
├── sketch.js           # p5.js logic and state machine
└── assets/
    ├── processing.mp3  # Background music
    ├── siren.wav       # Alert sound for vote rejection
    └── pineapple.png   # Header image
```

## 🚀 Setup & Usage

1. **Requirements**:
   - Modern web browser (Chrome/Firefox recommended)
   - Webcam access
   - Microphone access
   - Local server (due to browser security for camera/mic)

2. **Running Locally**:
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Or using Node.js
   npx http-server -p 8000
   ```

3. **Access**:
   Open `http://localhost:8000/pizza_dictator/`

4. **User Flow**:
   - Read and check all 10 Terms of Compliance
   - Click "START VOTING" (enabled only when all terms are checked)
   - Click anywhere to start background music (browser autoplay restriction)
   - Complete 5-second loading screen
   - View 8-second warning
   - Complete 5 face verification tasks
   - Shout the displayed oath loudly into your microphone
   - Wait 8 seconds for voice processing
   - Answer the question about pineapple on pizza
   - Experience the consequences of your choice

## ⚙️ Key State Machine

```
STATE_START → [Check all terms + Click Start]
  ↓
STATE_TRANSITION (5s loading)
  ↓
STATE_WARNING (8s warning)
  ↓
STATE_MOUTH (Face verification: 5 tasks)
  ↓
STATE_OATH (Voice authentication)
  ↓
STATE_PROCESSING (8s analysis)
  ↓
STATE_VOTE (The Question)
  ↓
STATE_VOTE_PROCESSING (3s)
  ↓
STATE_REJECTION (Results)
```

## 🎯 Recent Improvements

### Privacy & Terms Enhancements
- ✅ Expanded to 10 invasive terms (removed voting spoilers)
- ✅ Made "DATA CAPTURED" alert large, centered, and flashing
- ✅ Custom red/black scrollbar for Terms container
- ✅ Non-sticky header to prevent UI overlap

### Audio & Timing
- ✅ Background music starts on first user interaction
- ✅ Voice authentication slowed to 5-6 seconds (from instant)
- ✅ Processing time reduced to 8 seconds (from 10s)

### Bug Fixes
- ✅ Fixed "Start Voting" button activation logic
- ✅ Prevented UI text overlap during transitions
- ✅ Fixed progress bar visibility
- ✅ Ensured all 5 face verification steps are present
- ✅ Capped progress display at 100% (not 300%)
- ✅ Restored missing core functions (speak, startGame, etc.)

## 🎓 Educational Context

This project is designed to provoke reflection on:
- **Data Privacy**: How easily we accept invasive terms of service
- **Surveillance Capitalism**: Biometric data collection for trivial purposes
- **Digital Authoritarianism**: Using UX dark patterns to coerce consent
- **Absurdity as Critique**: Exaggerating to reveal the truth

## 📝 License

This is an art installation and educational project. Feel free to use, modify, and share with attribution.

## 🍍 The Big Question

*Does pineapple belong on pizza?*

**The system is watching your answer.**

---

**Remember**: This is satire. In real life, never blindly accept invasive terms of service, and always question why an app needs access to your biometric data just to perform a simple task.
