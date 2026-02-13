// Global Variables
let rawData = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 50;
let sortColumn = null;
let sortDirection = 'asc';
let charts = {};

// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    initializeTheme();
    setupKeyboardShortcuts();
});

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Press 'R' to reload/refresh the page
        if (event.key === 'r' || event.key === 'R') {
            // Don't trigger if user is typing in input field
            if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
                location.reload();
            }
        }
    });
}

// Theme Toggle
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeButton(true);
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeButton(isLight);

    // Refresh charts only if data is loaded
    if (rawData && rawData.length > 0) {
        // Use requestAnimationFrame for smoother transition
        requestAnimationFrame(() => {
            renderCharts();
        });
    }
}

function updateThemeButton(isLight) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');

    if (isLight) {
        // Sun icon for light mode
        themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        themeText.textContent = 'โหมดมืด';
    } else {
        // Moon icon for dark mode
        themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        themeText.textContent = 'โหมดสว่าง';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Filter controls
    document.getElementById('applyFilter').addEventListener('click', applyDateFilter);
    document.getElementById('resetFilter').addEventListener('click', resetFilter);

    // Export button
    document.getElementById('exportBtn').addEventListener('click', showExportMenu);
    document.getElementById('exportTableBtn').addEventListener('click', exportTableData);

    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Page size change
    document.getElementById('pageSize').addEventListener('change', handlePageSizeChange);

    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));

    // Table sorting
    document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => handleSort(th.dataset.sort));
    });
}

// Load CSV Data
function loadData() {
    console.log('Starting to load CSV file...');
    showLoading('กำลังโหลดข้อมูล...');
    updateProgress(5, 'กำลังโหลดไฟล์ CSV...');

    // Add timestamp to prevent browser caching
    const timestamp = new Date().getTime();
    Papa.parse(`cleaned_dataset9.csv?t=${timestamp}`, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        downloadRequestHeaders: undefined,
        complete: function (results) {
            console.log('✅ CSV Parse Complete! Total rows:', results.data.length);
            updateProgress(8, 'โหลดไฟล์สำเร็จ กำลังประมวลผล...');

            if (results.errors.length > 0) {
                console.error('CSV Errors:', results.errors);
            }

            // Check if data loaded successfully
            if (!results.data || results.data.length === 0) {
                console.error('No data loaded from CSV');
                updateProgress(0, '❌ ไม่พบข้อมูลในไฟล์');
                hideLoading();
                showError(
                    '⚠️ ไม่พบข้อมูลในไฟล์ CSV\n\n' +
                    'กรุณาตรวจสอบว่าไฟล์ cleaned_dataset9.csv ไม่ว่าง\n' +
                    'และอยู่ในโฟลเดอร์เดียวกับ analytics-dashboard.html'
                );
                return;
            }

            console.log(`Loaded ${results.data.length} records`);
            rawData = results.data;
            filteredData = [...rawData];
            currentPage = 1;

            // Progressive rendering with progress bar
            updateProgress(10, 'กำลังคำนวณ KPIs...');
            setTimeout(() => {
                updateKPIs();

                updateProgress(25, 'กำลังสร้างกราฟแนวโน้ม...');
                setTimeout(() => {
                    renderTrendChart();

                    updateProgress(40, 'กำลังสร้างกราฟความสัมพันธ์...');
                    setTimeout(() => {
                        renderCorrelationChart();

                        updateProgress(55, 'กำลังสร้างกราฟการกระจาย...');
                        setTimeout(() => {
                            renderDistributionCharts();

                            updateProgress(70, 'กำลังคำนวณ Correlation Matrix...');
                            setTimeout(() => {
                                calculateCorrelationMatrix();

                                updateProgress(85, 'กำลังคำนวณสถิติขั้นสูง...');
                                setTimeout(() => {
                                    calculateAdvancedStatistics();

                                    updateProgress(95, 'กำลังสร้างตาราง...');
                                    setTimeout(() => {
                                        renderTable();
                                        // renderPagination removed - function doesn't exist

                                        updateProgress(100, 'เสร็จสมบูรณ์!');
                                        setTimeout(() => {
                                            hideLoading();
                                        }, 300);
                                    }, 100);
                                }, 100);
                            }, 100);
                        }, 100);
                    }, 100);
                }, 100);
            }, 100);
        },
        error: function (error) {
            console.error('CSV Loading Error:', error);
            updateProgress(0, '❌ โหลดไฟล์ล้มเหลว');
            hideLoading();

            showError(
                '⚠️ ไม่สามารถโหลดไฟล์ CSV ได้\n\n' +
                '❌ สาเหตุ: Browser บล็อกการโหลดไฟล์ (CORS Policy)\n' +
                'หรือไม่พบไฟล์ cleaned_dataset9.csv\n\n' +
                '✅ วิธีแก้ (เลือก 1 วิธี):\n\n' +
                '📌 วิธีที่ 1: ใช้ Python HTTP Server (แนะนำ)\n' +
                '1. เปิด Command Prompt\n' +
                '2. พิมพ์: cd c:\\Users\\Asus\\Desktop\\vs-code\n' +
                '3. พิมพ์: python -m http.server 8000\n' +
                '4. เปิดเบราว์เซอร์: http://localhost:8000/analytics-dashboard.html\n\n' +
                '📌 วิธีที่ 2: ใช้ VS Code Live Server\n' +
                '1. ติดตั้ง Extension "Live Server"\n' +
                '2. คลิกขวาที่ไฟล์ analytics-dashboard.html\n' +
                '3. เลือก "Open with Live Server"\n\n' +
                '💡 ตรวจสอบว่าไฟล์ cleaned_dataset9.csv อยู่ในโฟลเดอร์เดียวกัน'
            );
        }
    });
}

// Initialize Date Filters
function initializeDateFilters() {
    if (rawData.length === 0) return;

    const dates = rawData.map(d => new Date(d.date)).filter(d => !isNaN(d));
    if (dates.length === 0) return;

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    document.getElementById('dateFrom').value = minDate.toISOString().split('T')[0];
    document.getElementById('dateTo').value = maxDate.toISOString().split('T')[0];
}

// Apply Date Filter
function applyDateFilter() {
    const dateFrom = new Date(document.getElementById('dateFrom').value);
    const dateTo = new Date(document.getElementById('dateTo').value);

    if (isNaN(dateFrom) || isNaN(dateTo)) {
        alert('กรุณาเลือกวันที่ให้ถูกต้อง');
        return;
    }

    if (dateFrom > dateTo) {
        alert('วันที่เริ่มต้นต้องน้อยกว่าหรือเท่ากับวันที่สิ้นสุด');
        return;
    }

    filteredData = rawData.filter(d => {
        const date = new Date(d.date);
        return date >= dateFrom && date <= dateTo;
    });

    currentPage = 1;
    updateDashboard();
}

// Reset Filter
function resetFilter() {
    filteredData = [...rawData];
    initializeDateFilters();
    document.getElementById('searchInput').value = '';
    currentPage = 1;
    updateDashboard();
}

// Search Handler
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();

    if (searchTerm === '') {
        // Reset to filtered data (by date)
        renderTable();
        return;
    }

    // Search in visible columns
    const searchColumns = ['date', '% Iron Concentrate', '% Silica Concentrate',
        'Ore Pulp pH', 'Ore Pulp Density', 'Starch Flow', 'Amina Flow'];

    const searchResults = filteredData.filter(row => {
        return searchColumns.some(col => {
            const value = row[col];
            if (value === null || value === undefined) return false;
            return value.toString().toLowerCase().includes(searchTerm);
        });
    });

    renderTable(searchResults);
}

// Handle Page Size Change
function handlePageSizeChange(e) {
    pageSize = e.target.value === 'all' ? filteredData.length : parseInt(e.target.value);
    currentPage = 1;
    renderTable();
}

// Handle Sort
function handleSort(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }

    // Update header classes
    document.querySelectorAll('.data-table th').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
    });

    const th = document.querySelector(`th[data-sort="${column}"]`);
    th.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');

    renderTable();
}

// Change Page
function changePage(direction) {
    const totalPages = Math.ceil(filteredData.length / pageSize);
    currentPage = Math.max(1, Math.min(totalPages, currentPage + direction));
    renderTable();
}

// Update Dashboard
function updateDashboard() {
    updateKPIs();
    renderCharts();
    renderTable();
    updateRecordCount();
}

// Update KPIs
function updateKPIs() {
    if (filteredData.length === 0) {
        // Set all to '-'
        ['avgIron', 'minIron', 'maxIron', 'avgSilica', 'minSilica', 'maxSilica',
            'avgPH', 'minPH', 'maxPH', 'totalRecords', 'dateRange'].forEach(id => {
                document.getElementById(id).textContent = '-';
            });
        return;
    }

    // Iron Concentrate
    const ironValues = filteredData.map(d => d['% Iron Concentrate']).filter(v => v !== null && !isNaN(v));
    const avgIron = ironValues.length > 0 ? (ironValues.reduce((a, b) => a + b, 0) / ironValues.length) : 0;
    const minIron = ironValues.length > 0 ? Math.min(...ironValues) : 0;
    const maxIron = ironValues.length > 0 ? Math.max(...ironValues) : 0;

    document.getElementById('avgIron').textContent = avgIron.toFixed(2) + '%';
    document.getElementById('minIron').textContent = minIron.toFixed(2) + '%';
    document.getElementById('maxIron').textContent = maxIron.toFixed(2) + '%';

    // Silica Concentrate
    const silicaValues = filteredData.map(d => d['% Silica Concentrate']).filter(v => v !== null && !isNaN(v));
    const avgSilica = silicaValues.length > 0 ? (silicaValues.reduce((a, b) => a + b, 0) / silicaValues.length) : 0;
    const minSilica = silicaValues.length > 0 ? Math.min(...silicaValues) : 0;
    const maxSilica = silicaValues.length > 0 ? Math.max(...silicaValues) : 0;

    document.getElementById('avgSilica').textContent = avgSilica.toFixed(2) + '%';
    document.getElementById('minSilica').textContent = minSilica.toFixed(2) + '%';
    document.getElementById('maxSilica').textContent = maxSilica.toFixed(2) + '%';

    // pH
    const phValues = filteredData.map(d => d['Ore Pulp pH']).filter(v => v !== null && !isNaN(v));
    const avgPH = phValues.length > 0 ? (phValues.reduce((a, b) => a + b, 0) / phValues.length) : 0;
    const minPH = phValues.length > 0 ? Math.min(...phValues) : 0;
    const maxPH = phValues.length > 0 ? Math.max(...phValues) : 0;

    document.getElementById('avgPH').textContent = avgPH.toFixed(2);
    document.getElementById('minPH').textContent = minPH.toFixed(2);
    document.getElementById('maxPH').textContent = maxPH.toFixed(2);

    // Total Records
    document.getElementById('totalRecords').textContent = filteredData.length.toLocaleString();

    // Date Range
    const dates = filteredData.map(d => new Date(d.date)).filter(d => !isNaN(d));
    if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        const days = Math.floor((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
        document.getElementById('dateRange').textContent = `${days} วัน`;
    }
}

// Helper function to get theme-aware colors
function getThemeColors() {
    const isLight = document.body.classList.contains('light-mode');
    return {
        text: isLight ? '#1a1a2e' : '#ffffff',
        grid: isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
        tooltip: {
            background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(26, 26, 36, 0.95)',
            text: isLight ? '#1a1a2e' : '#ffffff',
            border: isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
        }
    };
}

// Render Charts
function renderCharts() {
    renderTrendChart();
    renderCorrelationChart();
    renderDistributionCharts();

    // Re-render forecast chart if data exists
    if (forecastData && forecastData.dates) {
        renderForecastChart(
            forecastData.historicalDates,
            forecastData.historicalIron,
            forecastData.historicalSilica,
            [],
            [],
            forecastData.dates,
            forecastData.ironForecast,
            forecastData.silicaForecast
        );
    }

    // Re-render heatmap if correlation matrix exists
    if (correlationMatrix) {
        renderCorrelationHeatmap();
    }
}

// Render Trend Chart
function renderTrendChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) {
        console.error('Trend chart canvas not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    const colors = getThemeColors();

    // Destroy existing chart
    if (charts.trend) {
        charts.trend.destroy();
    }

    // Group by date and calculate averages
    const dateGroups = {};
    filteredData.forEach(row => {
        const date = row.date;
        if (!dateGroups[date]) {
            dateGroups[date] = {
                ironValues: [],
                silicaValues: []
            };
        }

        if (row['% Iron Concentrate'] !== null && !isNaN(row['% Iron Concentrate'])) {
            dateGroups[date].ironValues.push(row['% Iron Concentrate']);
        }
        if (row['% Silica Concentrate'] !== null && !isNaN(row['% Silica Concentrate'])) {
            dateGroups[date].silicaValues.push(row['% Silica Concentrate']);
        }
    });

    const dates = Object.keys(dateGroups).sort();
    const ironData = dates.map(date => {
        const values = dateGroups[date].ironValues;
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
    });
    const silicaData = dates.map(date => {
        const values = dateGroups[date].silicaValues;
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
    });

    charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: '% Iron Concentrate (ค่าเฉลี่ยรายวัน)',
                    data: ironData,
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '% Silica Concentrate (ค่าเฉลี่ยรายวัน)',
                    data: silicaData,
                    borderColor: 'rgb(245, 87, 108)',
                    backgroundColor: 'rgba(245, 87, 108, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: {
                        color: colors.text,
                        font: { size: 13 }
                    }
                },
                tooltip: {
                    backgroundColor: colors.tooltip.background,
                    titleColor: colors.tooltip.text,
                    bodyColor: colors.tooltip.text,
                    borderColor: colors.tooltip.border,
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    grid: {
                        color: colors.grid
                    },
                    ticks: {
                        color: colors.text,
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    grid: {
                        color: colors.grid
                    },
                    ticks: {
                        color: colors.text,
                        callback: function (value) {
                            return value.toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
}

// Render Correlation Chart
function renderCorrelationChart() {
    const canvas = document.getElementById('correlationChart');
    if (!canvas) {
        console.error('Correlation chart canvas not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    const colors = getThemeColors();

    if (charts.correlation) {
        charts.correlation.destroy();
    }

    const scatterData = filteredData
        .filter(d => d['Ore Pulp pH'] !== null && d['% Silica Concentrate'] !== null &&
            !isNaN(d['Ore Pulp pH']) && !isNaN(d['% Silica Concentrate']))
        .map(d => ({
            x: d['Ore Pulp pH'],
            y: d['% Silica Concentrate']
        }));

    charts.correlation = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'pH vs Silica Concentrate',
                data: scatterData,
                backgroundColor: 'rgba(79, 172, 254, 0.6)',
                borderColor: 'rgb(79, 172, 254)',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.75)',
                        font: { size: 13 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 36, 0.95)',
                    titleColor: '#fff',
                    bodyColor: 'rgba(255, 255, 255, 0.75)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function (context) {
                            return `pH: ${context.parsed.x.toFixed(2)}, Silica: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: colors.grid }, // Changed from hardcoded rgba
                    ticks: { color: colors.text }, // Changed from hardcoded rgba
                    title: {
                        display: true,
                        text: 'Ore Pulp pH',
                        color: colors.text, // Changed from hardcoded rgba
                        font: { size: 14, weight: 'bold' }
                    }
                },
                y: {
                    grid: { color: colors.grid }, // Changed from hardcoded rgba
                    ticks: {
                        color: colors.text, // Changed from hardcoded rgba
                        callback: function (value) {
                            return value.toFixed(1) + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: '% Silica Concentrate',
                        color: 'rgba(255, 255, 255, 0.5)',
                        callback: function (value) {
                            return value.toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
}

// Render Distribution Charts
function renderDistributionCharts() {
    const colors = getThemeColors();
    renderHistogram('ironDistChart', '% Iron Concentrate', 'rgb(102, 126, 234)', colors);
    renderHistogram('silicaDistChart', '% Silica Concentrate', 'rgb(245, 87, 108)', colors);
    // phDistChart removed - canvas doesn't exist in HTML
}

function renderHistogram(canvasId, column, color, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas element '${canvasId}' not found`);
        return;
    }

    const ctx = canvas.getContext('2d');

    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    const values = filteredData
        .map(d => d[column])
        .filter(v => v !== null && !isNaN(v));

    if (values.length === 0) return;

    // Create bins
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = 20;
    const binSize = (max - min) / binCount;

    const bins = Array(binCount).fill(0);
    const labels = [];

    for (let i = 0; i < binCount; i++) {
        const binStart = min + i * binSize;
        const binEnd = binStart + binSize;
        labels.push(binStart.toFixed(2));

        values.forEach(v => {
            if (v >= binStart && (i === binCount - 1 ? v <= binEnd : v < binEnd)) {
                bins[i]++;
            }
        });
    }

    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'จำนวน',
                data: bins,
                backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.6)'),
                borderColor: color,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: colors.text,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: colors.tooltip.background,
                    titleColor: colors.tooltip.text,
                    bodyColor: colors.tooltip.text,
                    borderColor: colors.tooltip.border,
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: column,
                        color: colors.text,
                        font: { size: 12 }
                    },
                    grid: {
                        color: colors.grid
                    },
                    ticks: {
                        color: colors.text,
                        maxRotation: 45
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'ความถี่',
                        color: colors.text,
                        font: { size: 12 }
                    },
                    grid: {
                        color: colors.grid
                    },
                    ticks: {
                        color: colors.text
                    }
                }
            }
        }
    });
}

// Render Table
function renderTable(dataToRender = null) {
    const data = dataToRender || filteredData;

    // Apply sorting
    let sortedData = [...data];
    if (sortColumn) {
        sortedData.sort((a, b) => {
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];

            // Handle null values
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            // Compare
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            } else {
                const aStr = String(aVal);
                const bStr = String(bVal);
                return sortDirection === 'asc' ?
                    aStr.localeCompare(bStr) :
                    bStr.localeCompare(aStr);
            }
        });
    }

    // Pagination
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, sortedData.length);
    const pageData = sortedData.slice(startIndex, endIndex);

    // Render table body
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">ไม่พบข้อมูล</td></tr>';
    } else {
        pageData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.date || '-'}</td>
                <td>${formatNumber(row['% Iron Concentrate'])}</td>
                <td>${formatNumber(row['% Silica Concentrate'])}</td>
                <td>${formatNumber(row['Ore Pulp pH'])}</td>
                <td>${formatNumber(row['Ore Pulp Density'])}</td>
                <td>${formatNumber(row['Starch Flow'])}</td>
                <td>${formatNumber(row['Amina Flow'])}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Update pagination
    document.getElementById('pageInfo').textContent = `หน้า ${currentPage} จาก ${totalPages || 1}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

// Update Record Count
function updateRecordCount() {
    document.getElementById('recordCount').textContent =
        `แสดง ${filteredData.length.toLocaleString()} รายการ`;
}

// Export Functions
function showExportMenu() {
    const menu = document.createElement('div');
    menu.className = 'export-menu show';
    menu.innerHTML = `
        <button onclick="exportData('csv')">ส่งออก CSV</button>
        <button onclick="exportData('json')">ส่งออก JSON</button>
    `;

    const btn = document.getElementById('exportBtn');
    const existing = document.querySelector('.export-menu');
    if (existing) existing.remove();

    btn.style.position = 'relative';
    btn.appendChild(menu);

    // Close on click outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!btn.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

function exportData(format) {
    if (format === 'csv') {
        const csv = Papa.unparse(filteredData);
        downloadFile(csv, 'mining_data.csv', 'text/csv');
    } else if (format === 'json') {
        const json = JSON.stringify(filteredData, null, 2);
        downloadFile(json, 'mining_data.json', 'application/json');
    }
}

function exportTableData() {
    const columns = ['date', '% Iron Concentrate', '% Silica Concentrate',
        'Ore Pulp pH', 'Ore Pulp Density', 'Starch Flow', 'Amina Flow'];
    const tableData = filteredData.map(row => {
        const obj = {};
        columns.forEach(col => obj[col] = row[col]);
        return obj;
    });

    const csv = Papa.unparse(tableData);
    downloadFile(csv, 'table_export.csv', 'text/csv');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Utility Functions
function formatNumber(value) {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return typeof value === 'number' ? value.toFixed(2) : value;
}

function showLoading(message = 'กำลังโหลดข้อมูล...') {
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
        loadingText.textContent = message;
    }
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }
}

function updateProgress(percentage, message) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const loadingText = document.getElementById('loadingText');

    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    if (progressText) {
        progressText.textContent = percentage + '%';
    }
    if (loadingText && message) {
        loadingText.textContent = message;
    }
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorModal.classList.add('show');
    hideLoading();
}

function closeErrorModal() {
    errorModal.classList.remove('show');
}

// ============================================
// ADVANCED ANALYTICS FEATURES
// ============================================

// Global variables for advanced features
let forecastData = null;
let correlationMatrix = null;

// Setup Advanced Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Forecast controls
    const generateForecastBtn = document.getElementById('generateForecast');
    const exportForecastBtn = document.getElementById('exportForecast');

    if (generateForecastBtn) {
        generateForecastBtn.addEventListener('click', generateForecast);
    }
    if (exportForecastBtn) {
        exportForecastBtn.addEventListener('click', exportForecastData);
    }
});

// ============================================
// LINEAR REGRESSION FUNCTIONS
// ============================================

function linearRegression(xValues, yValues) {
    const n = xValues.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += xValues[i];
        sumY += yValues[i];
        sumXY += xValues[i] * yValues[i];
        sumX2 += xValues[i] * xValues[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}

function predictLinearRegression(regression, x) {
    return regression.slope * x + regression.intercept;
}

// ============================================
// MOVING AVERAGE FUNCTIONS
// ============================================

function calculateMovingAverage(data, windowSize = 7) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        if (i < windowSize - 1) {
            result.push(null);
        } else {
            let sum = 0;
            for (let j = 0; j < windowSize; j++) {
                sum += data[i - j];
            }
            result.push(sum / windowSize);
        }
    }
    return result;
}

// ============================================
// FORECAST GENERATION
// ============================================

function generateForecast() {
    if (filteredData.length === 0) {
        alert('ไม่มีข้อมูลสำหรับการพยากรณ์');
        return;
    }

    const forecastDays = parseInt(document.getElementById('forecastDays').value);

    // Prepare time series data
    const dateGroups = {};
    filteredData.forEach(row => {
        const date = row.date;
        if (!dateGroups[date]) {
            dateGroups[date] = { ironValues: [], silicaValues: [] };
        }
        if (row['% Iron Concentrate'] !== null && !isNaN(row['% Iron Concentrate'])) {
            dateGroups[date].ironValues.push(row['% Iron Concentrate']);
        }
        if (row['% Silica Concentrate'] !== null && !isNaN(row['% Silica Concentrate'])) {
            dateGroups[date].silicaValues.push(row['% Silica Concentrate']);
        }
    });

    const dates = Object.keys(dateGroups).sort();
    const ironData = dates.map(date => {
        const values = dateGroups[date].ironValues;
        return values.length > 0 ? values.reduce((a, b) => a + b) / values.length : null;
    }).filter(v => v !== null);

    const silicaData = dates.map(date => {
        const values = dateGroups[date].silicaValues;
        return values.length > 0 ? values.reduce((a, b) => a + b) / values.length : null;
    }).filter(v => v !== null);

    // Create x-axis (day numbers)
    const xValues = Array.from({ length: ironData.length }, (_, i) => i);

    // Linear Regression for Iron
    const ironRegression = linearRegression(xValues, ironData);
    const ironForecast = [];
    for (let i = 0; i < forecastDays; i++) {
        const x = ironData.length + i;
        ironForecast.push(predictLinearRegression(ironRegression, x));
    }

    // Linear Regression for Silica
    const silicaRegression = linearRegression(xValues, silicaData);
    const silicaForecast = [];
    for (let i = 0; i < forecastDays; i++) {
        const x = silicaData.length + i;
        silicaForecast.push(predictLinearRegression(silicaRegression, x));
    }

    // Calculate Moving Average
    const ironMA = calculateMovingAverage(ironData, 7);
    const silicaMA = calculateMovingAverage(silicaData, 7);

    // Generate future dates
    const lastDate = new Date(dates[dates.length - 1]);
    const futureDates = [];
    for (let i = 1; i <= forecastDays; i++) {
        const futureDate = new Date(lastDate);
        futureDate.setDate(lastDate.getDate() + i);
        futureDates.push(futureDate.toISOString().split('T')[0]);
    }

    // Store forecast data
    forecastData = {
        dates: futureDates,
        ironForecast,
        silicaForecast,
        historicalDates: dates,
        historicalIron: ironData,
        historicalSilica: silicaData
    };

    // Render forecast chart
    renderForecastChart(dates, ironData, silicaData, ironMA, silicaMA, futureDates, ironForecast, silicaForecast);

    // Calculate and display metrics
    displayForecastMetrics(ironData, silicaData, ironRegression, silicaRegression);
}

// Render Forecast Chart
// Render Forecast Chart
function renderForecastChart(historicalDates, ironData, silicaData, ironMA, silicaMA, futureDates, ironForecast, silicaForecast) {
    const canvas = document.getElementById('forecastChart');
    if (!canvas) {
        console.error('Forecast chart canvas not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    const colors = getThemeColors();

    if (charts.forecast) {
        charts.forecast.destroy();
    }

    const allDates = [...historicalDates, ...futureDates];
    const ironHistorical = [...ironData, ...Array(futureDates.length).fill(null)];
    const silicaHistorical = [...silicaData, ...Array(futureDates.length).fill(null)];
    const ironPredicted = [...Array(historicalDates.length).fill(null), ...ironForecast];
    const silicaPredicted = [...Array(historicalDates.length).fill(null), ...silicaForecast];

    // Extend MA with last value
    const ironMAExtended = [...ironMA, ...Array(futureDates.length).fill(null)];
    const silicaMAExtended = [...silicaMA, ...Array(futureDates.length).fill(null)];

    charts.forecast = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allDates,
            datasets: [
                {
                    label: '% Iron Concentrate (ข้อมูลจริง)',
                    data: ironHistorical,
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                    pointRadius: 2
                },
                {
                    label: '% Iron Forecast (พยากรณ์)',
                    data: ironPredicted,
                    borderColor: 'rgb(137, 157, 252)',
                    backgroundColor: 'rgba(137, 157, 252, 0.2)',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false,
                    pointRadius: 4
                },
                {
                    label: '% Silica Concentrate (ข้อมูลจริง)',
                    data: silicaHistorical,
                    borderColor: 'rgb(245, 87, 108)',
                    backgroundColor: 'rgba(245, 87, 108, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                    pointRadius: 2
                },
                {
                    label: '% Silica Forecast (พยากรณ์)',
                    data: silicaPredicted,
                    borderColor: 'rgb(249, 120, 140)',
                    backgroundColor: 'rgba(249, 120, 140, 0.2)',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: {
                        color: colors.text,
                        font: { size: 13 }
                    }
                },
                tooltip: {
                    backgroundColor: colors.tooltip.background,
                    titleColor: colors.tooltip.text,
                    bodyColor: colors.tooltip.text,
                    borderColor: colors.tooltip.border,
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: { color: colors.grid },
                    ticks: {
                        color: colors.text,
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    grid: { color: colors.grid },
                    ticks: {
                        color: colors.text,
                        callback: function (value) {
                            return value.toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
}

function displayForecastMetrics(ironData, silicaData, ironRegression, silicaRegression) {
    const container = document.getElementById('forecastMetrics');

    // Calculate R² for Iron
    const ironR2 = calculateR2(ironData, ironRegression);

    // Calculate R² for Silica
    const silicaR2 = calculateR2(silicaData, silicaRegression);

    container.innerHTML = `
        <h4>📊 Forecast Accuracy Metrics</h4>
        <div class="metric-row">
            <span class="metric-label">Iron Forecast R² (ความถูกต้องของโมเดล)</span>
            <span class="metric-value">${ironR2.toFixed(4)}</span>
        </div>
        <div class="metric-row">
            <span class="metric-label">Iron Trend (อัตราการเปลี่ยนแปลงต่อวัน)</span>
            <span class="metric-value">${ironRegression.slope > 0 ? '+' : ''}${ironRegression.slope.toFixed(4)}%</span>
        </div>
        <div class="metric-row">
            <span class="metric-label">Silica Forecast R² (ความถูกต้องของโมเดล)</span>
            <span class="metric-value">${silicaR2.toFixed(4)}</span>
        </div>
        <div class="metric-row">
            <span class="metric-label">Silica Trend (อัตราการเปลี่ยนแปลงต่อวัน)</span>
            <span class="metric-value">${silicaRegression.slope > 0 ? '+' : ''}${silicaRegression.slope.toFixed(4)}%</span>
        </div>
    `;
}

function calculateR2(yValues, regression) {
    const n = yValues.length;
    const yMean = yValues.reduce((a, b) => a + b, 0) / n;

    let ssTotal = 0;
    let ssResidual = 0;

    for (let i = 0; i < n; i++) {
        const yPredicted = predictLinearRegression(regression, i);
        ssTotal += Math.pow(yValues[i] - yMean, 2);
        ssResidual += Math.pow(yValues[i] - yPredicted, 2);
    }

    return 1 - (ssResidual / ssTotal);
}

function exportForecastData() {
    if (!forecastData) {
        alert('กรุณาสร้างกราฟพยากรณ์ก่อน');
        return;
    }

    const csvData = forecastData.dates.map((date, i) => ({
        'Date': date,
        'Iron Forecast (%)': forecastData.ironForecast[i].toFixed(2),
        'Silica Forecast (%)': forecastData.silicaForecast[i].toFixed(2)
    }));

    const csv = Papa.unparse(csvData);
    downloadFile(csv, 'forecast_data.csv', 'text/csv');
}

// ============================================
// CORRELATION MATRIX
// ============================================

function calculateCorrelationMatrix() {
    const variables = [
        '% Iron Concentrate',
        '% Silica Concentrate',
        'Ore Pulp pH',
        'Ore Pulp Density',
        'Starch Flow',
        'Amina Flow'
    ];

    const matrix = [];

    for (let i = 0; i < variables.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < variables.length; j++) {
            const values1 = filteredData.map(d => d[variables[i]]).filter(v => v !== null && !isNaN(v));
            const values2 = filteredData.map(d => d[variables[j]]).filter(v => v !== null && !isNaN(v));

            const correlation = pearsonCorrelation(values1, values2);
            matrix[i][j] = correlation;
        }
    }

    correlationMatrix = { variables, matrix };
    renderCorrelationHeatmap();
}

function pearsonCorrelation(x, y) {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
        sumY2 += y[i] * y[i];
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
}

// Render Correlation Heatmap
function renderCorrelationHeatmap() {
    const colors = getThemeColors();
    if (!correlationMatrix) return;

    const ctx = document.getElementById('heatmapChart').getContext('2d');

    if (charts.heatmap) {
        charts.heatmap.destroy();
    }

    const { variables, matrix } = correlationMatrix;

    // Create heatmap data
    const heatmapData = [];
    for (let i = 0; i < variables.length; i++) {
        for (let j = 0; j < variables.length; j++) {
            heatmapData.push({
                x: variables[j],
                y: variables[i],
                v: matrix[i][j]
            });
        }
    }

    // Use matrix visualization with Chart.js
    charts.heatmap = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Correlation',
                data: heatmapData.map((d, idx) => ({
                    x: idx % variables.length,
                    y: Math.floor(idx / variables.length),
                    r: Math.abs(d.v) * 20
                })),
                backgroundColor: heatmapData.map(d => {
                    const value = d.v;
                    if (value > 0.7) return 'rgba(56, 239, 125, 0.8)';
                    if (value > 0.3) return 'rgba(79, 172, 254, 0.6)';
                    if (value > -0.3) return 'rgba(255, 255, 255, 0.3)';
                    if (value > -0.7) return 'rgba(245, 166, 35, 0.6)';
                    return 'rgba(245, 87, 108, 0.8)';
                })
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 36, 0.95)',
                    titleColor: '#fff',
                    bodyColor: 'rgba(255, 255, 255, 0.75)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        title: (items) => {
                            const item = items[0];
                            const idx = item.dataIndex;
                            const i = Math.floor(idx / variables.length);
                            const j = idx % variables.length;
                            return `${variables[i]} vs ${variables[j]}`;
                        },
                        label: (item) => {
                            const idx = item.dataIndex;
                            const i = Math.floor(idx / variables.length);
                            const j = idx % variables.length;
                            return `Correlation: ${matrix[i][j].toFixed(3)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'category',
                    labels: variables.map(v => v.substring(0, 15)),
                    ticks: {
                        color: colors.text,
                        font: { size: 10 }
                    },
                    grid: { color: colors.grid }
                },
                y: {
                    type: 'category',
                    labels: variables.map(v => v.substring(0, 15)),
                    reverse: true,
                    ticks: {
                        color: colors.text,
                        font: { size: 10 }
                    },
                    grid: { color: colors.grid }
                }
            }
        }
    });
}

// ============================================
// ADVANCED STATISTICS
// ============================================

function calculateAdvancedStatistics() {
    const variables = [
        { key: '% Iron Concentrate', name: 'Iron Concentrate' },
        { key: '% Silica Concentrate', name: 'Silica Concentrate' },
        { key: 'Ore Pulp pH', name: 'pH Level' }
    ];

    const container = document.getElementById('advancedStatsContainer');
    container.innerHTML = '';

    variables.forEach(variable => {
        const values = filteredData
            .map(d => d[variable.key])
            .filter(v => v !== null && !isNaN(v));

        if (values.length === 0) return;

        const stats = {
            mean: calculateMean(values),
            stdDev: calculateStdDev(values),
            variance: calculateVariance(values),
            skewness: calculateSkewness(values),
            kurtosis: calculateKurtosis(values),
            percentile25: calculatePercentile(values, 25),
            percentile50: calculatePercentile(values, 50),
            percentile75: calculatePercentile(values, 75),
            outliers: detectOutliers(values)
        };

        const statBox = document.createElement('div');
        statBox.className = 'stat-box';
        statBox.innerHTML = `
            <h4>${variable.name}</h4>
            <div class="stat-item">
                <span class="stat-label">Mean (ค่าเฉลี่ย)</span>
                <span class="stat-value">${stats.mean.toFixed(3)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Std Dev (ส่วนเบี่ยงเบนมาตรฐาน)</span>
                <span class="stat-value">${stats.stdDev.toFixed(3)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Variance (ความแปรปรวน)</span>
                <span class="stat-value">${stats.variance.toFixed(3)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Skewness (ความเบ้)</span>
                <span class="stat-value">${stats.skewness.toFixed(3)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Kurtosis (ความโด่ง)</span>
                <span class="stat-value">${stats.kurtosis.toFixed(3)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">25th Percentile</span>
                <span class="stat-value">${stats.percentile25.toFixed(3)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Median (50th Percentile)</span>
                <span class="stat-value">${stats.percentile50.toFixed(3)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">75th Percentile</span>
                <span class="stat-value">${stats.percentile75.toFixed(3)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Outliers (IQR Method)</span>
                <span class="stat-value">${stats.outliers.count} (${((stats.outliers.count / values.length) * 100).toFixed(1)}%)</span>
            </div>
        `;

        container.appendChild(statBox);
    });
}

function calculateMean(values) {
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function calculateVariance(values) {
    const mean = calculateMean(values);
    return values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
}

function calculateStdDev(values) {
    return Math.sqrt(calculateVariance(values));
}

function calculateSkewness(values) {
    const n = values.length;
    const mean = calculateMean(values);
    const stdDev = calculateStdDev(values);

    const sum = values.reduce((acc, value) => acc + Math.pow((value - mean) / stdDev, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sum;
}

function calculateKurtosis(values) {
    const n = values.length;
    const mean = calculateMean(values);
    const stdDev = calculateStdDev(values);

    const sum = values.reduce((acc, value) => acc + Math.pow((value - mean) / stdDev, 4), 0);
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
}

function calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function detectOutliers(values) {
    const q1 = calculatePercentile(values, 25);
    const q3 = calculatePercentile(values, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outliers = values.filter(v => v < lowerBound || v > upperBound);

    return {
        count: outliers.length,
        lowerBound,
        upperBound,
        values: outliers
    };
}

// ============================================
// UPDATE DASHBOARD TO INCLUDE ADVANCED FEATURES
// ============================================

// Override the original renderCharts function
const originalRenderCharts = renderCharts;
renderCharts = function () {
    originalRenderCharts();
    calculateCorrelationMatrix();
    calculateAdvancedStatistics();
};

