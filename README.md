# 📊 Analytics Dashboard - Flotation Plant Monitoring

Interactive web-based analytics dashboard for monitoring and analyzing flotation plant data with real-time insights, forecasting, and comprehensive data visualization.

## 🌐 Live Demo

🔗 **[View Live Dashboard](https://your-username.github.io/your-repo-name/analytics-dashboard.html)**

## ✨ Features

- 📈 **Real-time KPI Cards** - Iron & Silica concentrate monitoring
- 📊 **Interactive Charts** - Trend analysis, correlation, distribution
- 🔮 **Forecasting** - Linear regression with moving averages
- 🗺️ **Correlation Heatmap** - Variable relationship analysis
- 🌓 **Dark/Light Mode** - Theme toggle with persistent preference
- 📱 **Responsive Design** - Optimized for 1920x1080 displays
- ⚡ **Progressive Loading** - Visual progress bar with status updates

## 🚀 Quick Start

### Option 1: View Online (Recommended)
Simply visit the live demo link above!

### Option 2: Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Start local server**
   - **Windows:** Double-click `start-server.bat`
   - **Mac/Linux:** Run `python -m http.server 8000`

3. **Open in browser**
   ```
   http://localhost:8000/analytics-dashboard.html
   ```

## 📁 Project Structure

```
├── analytics-dashboard.html    # Main web interface
├── analytics-dashboard.js      # JavaScript (Charts, Data processing)
├── analytics-dashboard.css     # Styling
├── cleaned_dataset9.csv        # Cleaned data (1.5 MB)
├── start-server.bat           # Quick server launcher
├── index.py                   # Data cleaning script
├── dashboard.py               # Python visualization
└── methodology.md             # Statistical methodology
```

## 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Charts:** Chart.js
- **Data Processing:** Papa Parse (CSV parsing)
- **Backend (Optional):** Python (Pandas, Matplotlib, Seaborn)

## 📊 Data Analysis Scripts

### Clean Raw Data
```bash
python index.py
```
- Input: `dataset9.csv` (51 MB raw data)
- Output: `cleaned_dataset9.csv` (1.5 MB cleaned data)

### Generate Python Dashboard
```bash
python dashboard.py
```
- Creates Matplotlib visualization dashboard

## 🔧 Installation (for Python scripts)

```bash
# Install required libraries
pip install -r requirements.txt

# Or use the batch file
install-libraries.bat
```

## 📖 Documentation

See [`methodology.md`](methodology.md) for detailed information about:
- Statistical calculations
- Forecasting algorithms
- Data cleaning procedures
- KPI definitions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

Your Name - [@your-github](https://github.com/your-username)

## 🙏 Acknowledgments

- Dataset: Flotation Plant Process Data
- Built with Chart.js and modern web technologies
