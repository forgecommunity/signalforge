# ⚡ SignalForge React Native - Quick Start

<div align="center">

**Get Running in 5 Minutes!**

</div>

---

## 🎯 What is This?

An **interactive demo app** with **16 screens** teaching you SignalForge through hands-on examples. Like a playground + tutorial + reference guide all in one!

---

## 🚀 Setup (Choose Your Path)

### Path A: First Time User

```bash
# 1. Clone or navigate to repo root
cd path/to/SignalForge

# 2. Build the library
npm install
npm run build

# 3. Go to example
cd examples/sfReactNative

# 4. Install dependencies
npm install

# 5. iOS only: Install pods
cd ios && pod install && cd ..

# 6. Run!
npm start
# Then in another terminal:
npm run ios     # macOS
# OR
npm run android # Any OS
```

### Path B: Already Have Repo

```bash
cd examples/sfReactNative
npm start
# New terminal:
npm run ios  # or android
```

### Path C: Issues? Reset Everything

```bash
# From repo root:
npm run build

# From examples/sfReactNative:
rm -rf node_modules
npm install
npm start -- --reset-cache

# New terminal:
npm run android  # or ios
```

---

## 📱 Using the App

### Home Screen
You'll see a list of 16 demos. **Start with #1** and work your way down!

### Each Demo Screen Has:
- 📋 **Title & Description** - What you'll learn
- 🎮 **Interactive Controls** - Buttons, inputs, sliders
- 📊 **Live Display** - See values update in real-time
- 💻 **Code Box** - The actual code that makes it work
- 🎯 **Key Concepts** - What to remember

---

## 🎓 Recommended Learning Order

### Speed Run (30 mins)
```
1 → 2 → 7 → 8
Basic → Computed → React Hooks → Shopping Cart
```
You'll understand 80% of SignalForge!

### Standard Course (2 hours)
```
1 → 2 → 3 → 7 → 8 → 10 → 12
```
Covers all essential features + persistence.

### Master Class (3 hours)
```
All 16 screens in order
```
Complete understanding of everything!

---

## 💡 Pro Tips

### 1. Read the Code Boxes
Don't just play with buttons! The code snippets are the key to understanding.

### 2. Try to Break Things
Spam buttons, enter weird data, see what happens. Learning by experimentation!

### 3. Check Performance
Notice the millisecond timings in Batch Updates (Screen 4) and Big Data (Screen 16).

### 4. Test Persistence
On Screen 12, change values → close app completely → reopen → data is still there! 🤯

### 5. Follow the Logs
Many screens have activity logs showing what's happening behind the scenes.

---

## 🎯 What Each Screen Teaches

| # | Screen | What It Does | Must Try |
|---|--------|--------------|----------|
| 1 | Basic Signal | Signals 101 | Click all buttons |
| 2 | Computed | Auto-calculation | Change price/qty |
| 3 | Effects | Side effects | Watch console |
| 4 | Batch Updates | Performance | Compare timings! |
| 5 | Subscribe | Manual subs | Subscribe/unsub |
| 6 | Untrack | Break deps | Advanced pattern |
| 7 | React Hooks | Integration | Try all 3 hooks |
| 8 | Shopping Cart | Real example | Add/remove items |
| 9 | Form | Validation | Type invalid data |
| 10 | Todo | CRUD ops | Filter, complete |
| 11 | Array | Collections | Push, pop, filter |
| 12 | Persist | Storage | Close & reopen! |
| 13 | Time Travel | Undo/redo | Make changes, undo |
| 14 | DevTools | Debugging | Monitor updates |
| 15 | Classes | HOC pattern | Legacy support |
| 16 | Big Data | Scale | 5000 items! |

---

## 🐛 Troubleshooting

### App won't start?
```bash
cd examples/sfReactNative
npm start -- --reset-cache
```

### "Module not found"?
```bash
# Rebuild library from root:
cd ../../
npm run build
cd examples/sfReactNative
```

### iOS build fails?
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android issues?
```bash
# Clean build:
cd android
./gradlew clean
cd ..
npm run android
```

---

## 📚 More Help

- 📘 [DEMO_GUIDE.md](./DEMO_GUIDE.md) - Detailed screen-by-screen guide
- 📖 [FEATURES.md](./FEATURES.md) - Complete feature reference
- 🗂️ [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) - Master documentation index
- 💬 [GitHub Issues](https://github.com/forgecommunity/signalforge/issues) - Ask questions

---

## 🎉 Next Steps

After finishing the demos:

1. **Build something small** - Start with a counter or todo list
2. **Read the docs** - Check out `docs/getting-started.md`
3. **Explore the code** - Look at screen implementations
4. **Share feedback** - Open issues, star the repo!

---

<div align="center">

**Ready to learn? Let's go! 🚀**

[← Back to Main README](./README.md) | [View Demo Guide →](./DEMO_GUIDE.md)

</div>
