(function () {

    "use strict";

    window.EF = window.EF || {};

    EF.formatCurrency = function (value) {

        return Number(value).toLocaleString("es-ES", {

            style: "currency",

            currency: "EUR",

            minimumFractionDigits: 0,

            maximumFractionDigits: 0

        });

    };

    EF.parseNumber = function (input) {

        if (!input) return NaN;

        let value = input.value.trim();

        const isPercentage =

            input.classList.contains("ef-rate") ||

            input.classList.contains("ef-annual-return") ||

            input.classList.contains("ef-withdrawal-rate") ||

            input.classList.contains("ef-real-return");

        if (isPercentage) {

            value = value.replace(",", ".");

        } else {

            value = value.replace(/\./g, "");

        }

        return parseFloat(value);

    };

    EF.formatInput = function (value, input) {

        const isPercentage =

            input.classList.contains("ef-rate") ||

            input.classList.contains("ef-annual-return") ||

            input.classList.contains("ef-withdrawal-rate") ||

            input.classList.contains("ef-real-return");

        if (isPercentage) {

            let clean = value.replace(/[^\d,]/g, "");

            const parts = clean.split(",");

            if (parts.length > 2) {

                clean = parts[0] + "," + parts.slice(1).join("");

            }

            if (parts[1] !== undefined) {

                return parts[0] + "," + parts[1].slice(0, 2);

            }

            return clean;

        }

        const clean = value.replace(/\D/g, "");

        if (!clean) return "";

        return clean.replace(

            /\B(?=(\d{3})+(?!\d))/g,

            "."

        );

    };

    EF.setupInputs = function (calculator) {

        calculator.querySelectorAll(".ef-input").forEach(function (input) {

            if (input.tagName === "SELECT") return;

            input.addEventListener("input", function () {

                const cursorPosition = this.selectionStart;

                const originalLength = this.value.length;

                this.value = EF.formatInput(this.value, this);

                const newLength = this.value.length;

                const newCursorPosition =

                    cursorPosition + (newLength - originalLength);

                this.setSelectionRange(

                    newCursorPosition,

                    newCursorPosition

                );

            });

        });

    };

    EF.showError = function (calculator) {

        const error = calculator.querySelector(".ef-error");

        if (!error) return;

        error.textContent =

            "Introduce valores válidos para realizar el cálculo.";

        error.style.display = "block";

    };

    EF.showResults = function (calculator) {

        const elements = [

            ".ef-results",

            ".ef-chart",

            ".ef-share",

            ".ef-reset"

        ];

        elements.forEach(function (selector) {

            const element = calculator.querySelector(selector);

            if (element) element.style.display =

                selector === ".ef-results" ? "grid" : "block";

        });

    };

    EF.setupReset = function (calculator) {

        const reset = calculator.querySelector(".ef-reset");

        if (!reset) return;

        reset.addEventListener("click", function () {

            calculator.querySelectorAll("input").forEach(function (input) {

                input.value = "";

            });

            calculator.querySelectorAll("select").forEach(function (select) {

                select.selectedIndex = 0;

            });

            [

                ".ef-error",

                ".ef-results",

                ".ef-chart",

                ".ef-share"

            ].forEach(function (selector) {

                const element = calculator.querySelector(selector);

                if (element) element.style.display = "none";

            });

            reset.style.display = "none";

            if (calculator._efChart) {

                calculator._efChart.destroy();

                calculator._efChart = null;

            }

            const feedback = calculator.querySelector(

                ".ef-share-feedback"

            );

            if (feedback) feedback.textContent = "";

        });

    };

    EF.setupSharing = function (calculator, getShareText) {

        const feedback = calculator.querySelector(

            ".ef-share-feedback"

        );

        const shareText = function () {

            return encodeURIComponent(getShareText());

        };

        const whatsapp = calculator.querySelector(

            ".ef-share-whatsapp"

        );

        if (whatsapp) {

            whatsapp.addEventListener("click", function () {

                window.open(

                    "https://wa.me/?text=" + shareText(),

                    "_blank"

                );

            });

        }

        const telegram = calculator.querySelector(

            ".ef-share-telegram"

        );

        if (telegram) {

            telegram.addEventListener("click", function () {

                window.open(

                    "https://t.me/share/url?url=" +

                    encodeURIComponent(window.location.href) +

                    "&text=" +

                    shareText(),

                    "_blank"

                );

            });

        }

        const facebook = calculator.querySelector(

            ".ef-share-facebook"

        );

        if (facebook) {

            facebook.addEventListener("click", function () {

                window.open(

                    "https://www.facebook.com/sharer/sharer.php?u=" +

                    encodeURIComponent(window.location.href),

                    "_blank"

                );

            });

        }

        const x = calculator.querySelector(".ef-share-x");

        if (x) {

            x.addEventListener("click", function () {

                window.open(

                    "https://twitter.com/intent/tweet?text=" +

                    shareText() +

                    "&url=" +

                    encodeURIComponent(window.location.href),

                    "_blank"

                );

            });

        }

        const copy = calculator.querySelector(".ef-share-copy");

        if (copy) {

            copy.addEventListener("click", async function () {

                try {

                    await navigator.clipboard.writeText(

                        getShareText()

                    );

                    if (feedback) {

                        feedback.textContent =

                            "Resultado copiado al portapapeles.";

                    }

                } catch (error) {

                    if (feedback) {

                        feedback.textContent =

                            "No se ha podido copiar el resultado.";

                    }

                }

            });

        }

    };

    EF.createChart = function (calculator, result, datasets) {

        const canvas = calculator.querySelector(

            ".ef-chart-canvas"

        );

        if (!canvas || typeof Chart === "undefined") return;

        if (calculator._efChart) {

            calculator._efChart.destroy();

        }

        const labels = result.annualData.map(function (item) {

            return item.year;

        });

        calculator._efChart = new Chart(canvas, {

            type: "line",

            data: {

                labels: labels,

                datasets: datasets

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    mode: "index",

                    intersect: false

                },

                plugins: {

                    legend: {

                        position: "bottom",

                        labels: {

                            usePointStyle: true,

                            pointStyle: "circle",

                            boxWidth: 8,

                            boxHeight: 8,

                            padding: 20,

                            font: {

                                family: "Nunito Sans"

                            }

                        }

                    },

                    tooltip: {

                        callbacks: {

                            label: function (context) {

                                return (

                                    context.dataset.label +

                                    ": " +

                                    EF.formatCurrency(

                                        context.parsed.y

                                    )

                                );

                            }

                        }

                    }

                },

                scales: {

                    x: {

                        title: {

                            display: true,

                            text: "Años",

                            font: {

                                family: "Nunito Sans"

                            }

                        },

                        ticks: {

                            font: {

                                family: "Nunito Sans"

                            }

                        }

                    },

                    y: {

                        beginAtZero: true,

                        ticks: {

                            font: {

                                family: "Nunito Sans"

                            },

                            callback: function (value) {

                                return EF.formatCurrency(value);

                            }

                        }

                    }

                }

            }

        });

    };

    EF.compound = function (

        capital,

        monthly,

        rate,

        years,

        frequency

    ) {

        let balance = capital;

        let totalInterest = 0;

        const monthsPerPeriod = 12 / frequency;

        const periodRate = rate / 100 / frequency;

        const totalMonths = years * 12;

        const annualData = [{

            year: 0,

            invested: capital,

            interest: 0,

            balance: capital

        }];

        for (let month = 1; month <= totalMonths; month++) {

            balance += monthly;

            if (month % monthsPerPeriod === 0) {

                const interest = balance * periodRate;

                balance += interest;

                totalInterest += interest;

            }

            if (month % 12 === 0) {

                annualData.push({

                    year: month / 12,

                    invested: capital + monthly * month,

                    interest: totalInterest,

                    balance: balance

                });

            }

        }

        return {

            invested: capital + monthly * totalMonths,

            interest: totalInterest,

            final: balance,

            annualData: annualData

        };

    };

    EF.simple = function (capital, rate, years) {

        const annualInterest = capital * (rate / 100);

        const annualData = [];

        for (let year = 0; year <= years; year++) {

            const interest = annualInterest * year;

            annualData.push({

                year: year,

                invested: capital,

                interest: interest,

                balance: capital + interest

            });

        }

        return {

            invested: capital,

            interest: annualInterest * years,

            final: capital + annualInterest * years,

            annualData: annualData

        };

    };

    EF.simpleSavings = function (

        capital,

        contribution,

        rate,

        years,

        frequency

    ) {

        const totalPeriods = years * frequency;

        const periodRate = rate / 100 / frequency;

        const annualData = [{

            year: 0,

            invested: capital,

            interest: 0,

            balance: capital

        }];

        let totalInterest = capital * (rate / 100) * years;

        let totalInvested = capital;

        for (let period = 1; period <= totalPeriods; period++) {

            const remainingPeriods = totalPeriods - period;

            totalInterest +=

                contribution *

                periodRate *

                remainingPeriods;

            totalInvested += contribution;

            if (period % frequency === 0) {

                annualData.push({

                    year: period / frequency,

                    invested: totalInvested,

                    interest: totalInterest,

                    balance: totalInvested + totalInterest

                });

            }

        }

        return {

            invested: totalInvested,

            interest: totalInterest,

            final: totalInvested + totalInterest,

            annualData: annualData

        };

    };

    EF.mortgage = function (loan, rate, years) {

        const monthlyRate = rate / 100 / 12;

        const totalMonths = years * 12;

        let monthlyPayment;

        if (monthlyRate === 0) {

            monthlyPayment = loan / totalMonths;

        } else {

            monthlyPayment =

                loan *

                (

                    monthlyRate *

                    Math.pow(

                        1 + monthlyRate,

                        totalMonths

                    )

                ) /

                (

                    Math.pow(

                        1 + monthlyRate,

                        totalMonths

                    ) - 1

                );

        }

        let balance = loan;

        let totalInterest = 0;

        const annualData = [{

            year: 0,

            balance: loan,

            interest: 0

        }];

        for (let month = 1; month <= totalMonths; month++) {

            const interest = balance * monthlyRate;

            const principal = monthlyPayment - interest;

            balance -= principal;

            totalInterest += interest;

            if (month % 12 === 0) {

                annualData.push({

                    year: month / 12,

                    balance: Math.max(balance, 0),

                    interest: totalInterest

                });

            }

        }

        return {

            monthlyPayment: monthlyPayment,

            totalInterest: totalInterest,

            totalPaid: loan + totalInterest,

            annualData: annualData

        };

    };

    EF.financialIndependence = function (

        currentCapital,

        annualExpenses,

        monthlySavings,

        annualReturn,

        withdrawalRate

    ) {

        const targetCapital =

            annualExpenses /

            (withdrawalRate / 100);

        const monthlyReturn =

            Math.pow(

                1 + annualReturn / 100,

                1 / 12

            ) - 1;

        let capital = currentCapital;

        let months = 0;

        const annualData = [{

            year: 0,

            capital: capital,

            target: targetCapital

        }];

        while (capital < targetCapital && months < 1200) {

            capital =

                capital * (1 + monthlyReturn) +

                monthlySavings;

            months++;

            if (months % 12 === 0) {

                annualData.push({

                    year: months / 12,

                    capital: capital,

                    target: targetCapital

                });

            }

        }

        return {

            target: targetCapital,

            years: months / 12,

            capital: capital,

            annualData: annualData

        };

    };

    EF.emergencyFund = function (

        monthlyExpenses,

        coverageMonths,

        currentSavings,

        monthlyContribution

    ) {

        const target = monthlyExpenses * coverageMonths;

        const remaining = Math.max(

            target - currentSavings,

            0

        );

        let months = 0;

        let capital = currentSavings;

        const annualData = [{

            year: 0,

            capital: capital,

            target: target

        }];

        if (remaining > 0 && monthlyContribution > 0) {

            while (capital < target && months < 1200) {

                capital += monthlyContribution;

                months++;

                if (months % 12 === 0) {

                    annualData.push({

                        year: months / 12,

                        capital: Math.min(capital, target),

                        target: target

                    });

                }

            }

            if (months % 12 !== 0 && months < 1200) {

                annualData.push({

                    year: months / 12,

                    capital: Math.min(capital, target),

                    target: target

                });

            }

        }

        return {

            target: target,

            remaining: remaining,

            months: months,

            annualData: annualData

        };

    };

    EF.retirement = function (

        currentAge,

        retirementAge,

        currentSavings,

        monthlyContribution,

        realReturn,

        monthlyIncome,

        retirementYears

    ) {

        const yearsToRetirement = retirementAge - currentAge;

        const monthlyRate =

            Math.pow(

                1 + realReturn / 100,

                1 / 12

            ) - 1;

        const totalMonths = retirementYears * 12;

        let targetCapital;

        if (monthlyRate === 0) {

            targetCapital = monthlyIncome * totalMonths;

        } else {

            targetCapital =

                monthlyIncome *

                (

                    1 -

                    Math.pow(

                        1 + monthlyRate,

                        -totalMonths

                    )

                ) /

                monthlyRate;

        }

        let projectedCapital = currentSavings;

        const annualData = [{

            year: 0,

            capital: projectedCapital,

            target: targetCapital

        }];

        for (

            let month = 1;

            month <= yearsToRetirement * 12;

            month++

        ) {

            projectedCapital =

                projectedCapital *

                (1 + monthlyRate) +

                monthlyContribution;

            if (month % 12 === 0) {

                annualData.push({

                    year: month / 12,

                    capital: projectedCapital,

                    target: targetCapital

                });

            }

        }

        return {

            target: targetCapital,

            projected: projectedCapital,

            difference: projectedCapital - targetCapital,

            yearsToRetirement: yearsToRetirement,

            annualData: annualData

        };

    };

    function getValue(calculator, selector) {

        return EF.parseNumber(

            calculator.querySelector(selector)

        );

    }

    function hideResults(calculator) {

        [

            ".ef-results",

            ".ef-chart",

            ".ef-share",

            ".ef-reset"

        ].forEach(function (selector) {

            const element = calculator.querySelector(selector);

            if (element) element.style.display = "none";

        });

    }

    function showError(calculator) {

        hideResults(calculator);

        EF.showError(calculator);

    }

    function setupCalculator(selector, calculate) {

        document.querySelectorAll(selector).forEach(function (calculator) {

            EF.setupInputs(calculator);

            EF.setupReset(calculator);

            const button = calculator.querySelector(".ef-button");

            if (!button) return;

            button.addEventListener("click", function () {

                const result = calculate(calculator);

                if (!result) {

                    showError(calculator);

                    return;

                }

                const error = calculator.querySelector(".ef-error");

                if (error) error.style.display = "none";

                EF.showResults(calculator);

                result.display(calculator);

                EF.createChart(

                    calculator,

                    result.chart,

                    result.datasets

                );

            });

        });

    }

    function line(label, data, color, width) {

        return {

            label: label,

            data: data,

            borderColor: color,

            borderWidth: width,

            pointRadius: 0,

            pointHoverRadius: 5,

            pointHitRadius: 12,

            tension: 0.25,

            fill: false

        };

    }

    setupCalculator(

        ".ef-interest-calculator",

        function (calculator) {

            const capital = getValue(calculator, ".ef-capital");

            const monthly = getValue(calculator, ".ef-monthly");

            const rate = getValue(calculator, ".ef-rate");

            const years = getValue(calculator, ".ef-years");

            const frequency = parseInt(

                calculator.querySelector(".ef-frequency").value

            );

            if (

                isNaN(capital) ||

                isNaN(monthly) ||

                isNaN(rate) ||

                isNaN(years) ||

                capital < 0 ||

                monthly < 0 ||

                rate < 0 ||

                years <= 0

            ) return null;

            const result = EF.compound(

                capital,

                monthly,

                rate,

                years,

                frequency

            );

            return {

                chart: result,

                display: function (calculator) {

                    calculator.querySelector(

                        ".ef-total-invested"

                    ).textContent = EF.formatCurrency(result.invested);

                    calculator.querySelector(

                        ".ef-total-interest"

                    ).textContent = EF.formatCurrency(result.interest);

                    calculator.querySelector(

                        ".ef-final-balance"

                    ).textContent = EF.formatCurrency(result.final);

                },

                datasets: [

                    line(

                        "Capital aportado",

                        result.annualData.map(function (item) {

                            return item.invested;

                        }),

                        "#8AAE6D",

                        2

                    ),

                    line(

                        "Intereses generados",

                        result.annualData.map(function (item) {

                            return item.interest;

                        }),

                        "#BC6B4A",

                        2

                    ),

                    line(

                        "Capital total",

                        result.annualData.map(function (item) {

                            return item.balance;

                        }),

                        "#3E5A3C",

                        3

                    )

                ]

            };

        }

    );

    setupCalculator(

        ".ef-simple-interest-calculator",

        function (calculator) {

            const capital = getValue(calculator, ".ef-capital");

            const rate = getValue(calculator, ".ef-rate");

            const years = getValue(calculator, ".ef-years");

            if (

                isNaN(capital) ||

                isNaN(rate) ||

                isNaN(years) ||

                capital < 0 ||

                rate < 0 ||

                years <= 0

            ) return null;

            const result = EF.simple(capital, rate, years);

            return {

                chart: result,

                display: function (calculator) {

                    calculator.querySelector(

                        ".ef-total-invested"

                    ).textContent = EF.formatCurrency(result.invested);

                    calculator.querySelector(

                        ".ef-total-interest"

                    ).textContent = EF.formatCurrency(result.interest);

                    calculator.querySelector(

                        ".ef-final-balance"

                    ).textContent = EF.formatCurrency(result.final);

                },

                datasets: [

                    line(

                        "Capital inicial",

                        result.annualData.map(function (item) {

                            return item.invested;

                        }),

                        "#8AAE6D",

                        2

                    ),

                    line(

                        "Intereses generados",

                        result.annualData.map(function (item) {

                            return item.interest;

                        }),

                        "#BC6B4A",

                        2

                    ),

                    line(

                        "Capital total",

                        result.annualData.map(function (item) {

                            return item.balance;

                        }),

                        "#3E5A3C",

                        3

                    )

                ]

            };

        }

    );

    setupCalculator(

        ".ef-simple-savings-calculator",

        function (calculator) {

            const capital = getValue(calculator, ".ef-capital");

            const contribution = getValue(

                calculator,

                ".ef-contribution"

            );

            const rate = getValue(calculator, ".ef-rate");

            const years = getValue(calculator, ".ef-years");

            const frequency = parseInt(

                calculator.querySelector(".ef-frequency").value

            );

            if (

                isNaN(capital) ||

                isNaN(contribution) ||

                isNaN(rate) ||

                isNaN(years) ||

                capital < 0 ||

                contribution < 0 ||

                rate < 0 ||

                years <= 0

            ) return null;

            const result = EF.simpleSavings(

                capital,

                contribution,

                rate,

                years,

                frequency

            );

            return {

                chart: result,

                display: function (calculator) {

                    calculator.querySelector(

                        ".ef-total-invested"

                    ).textContent = EF.formatCurrency(result.invested);

                    calculator.querySelector(

                        ".ef-total-interest"

                    ).textContent = EF.formatCurrency(result.interest);

                    calculator.querySelector(

                        ".ef-final-balance"

                    ).textContent = EF.formatCurrency(result.final);

                },

                datasets: [

                    line(

                        "Capital aportado",

                        result.annualData.map(function (item) {

                            return item.invested;

                        }),

                        "#8AAE6D",

                        2

                    ),

                    line(

                        "Intereses generados",

                        result.annualData.map(function (item) {

                            return item.interest;

                        }),

                        "#BC6B4A",

                        2

                    ),

                    line(

                        "Capital total",

                        result.annualData.map(function (item) {

                            return item.balance;

                        }),

                        "#3E5A3C",

                        3

                    )

                ]

            };

        }

    );

    setupCalculator(

        ".ef-mortgage-calculator",

        function (calculator) {

            const loan = getValue(calculator, ".ef-loan");

            const rate = getValue(calculator, ".ef-rate");

            const years = getValue(calculator, ".ef-years");

            if (

                isNaN(loan) ||

                isNaN(rate) ||

                isNaN(years) ||

                loan <= 0 ||

                rate < 0 ||

                years <= 0

            ) return null;

            const result = EF.mortgage(loan, rate, years);

            return {

                chart: result,

                display: function (calculator) {

                    calculator.querySelector(

                        ".ef-monthly-payment"

                    ).textContent = EF.formatCurrency(

                        result.monthlyPayment

                    );

                    calculator.querySelector(

                        ".ef-total-interest"

                    ).textContent = EF.formatCurrency(

                        result.totalInterest

                    );

                    calculator.querySelector(

                        ".ef-total-paid"

                    ).textContent = EF.formatCurrency(

                        result.totalPaid

                    );

                },

                datasets: [

                    line(

                        "Deuda pendiente",

                        result.annualData.map(function (item) {

                            return item.balance;

                        }),

                        "#3E5A3C",

                        3

                    ),

                    line(

                        "Intereses acumulados",

                        result.annualData.map(function (item) {

                            return item.interest;

                        }),

                        "#BC6B4A",

                        2

                    )

                ]

            };

        }

    );

    setupCalculator(

        ".ef-financial-independence-calculator",

        function (calculator) {

            const currentCapital = getValue(

                calculator,

                ".ef-current-capital"

            );

            const annualExpenses = getValue(

                calculator,

                ".ef-annual-expenses"

            );

            const monthlySavings = getValue(

                calculator,

                ".ef-monthly-savings"

            );

            const annualReturn = getValue(

                calculator,

                ".ef-annual-return"

            );

            const withdrawalRate = getValue(

                calculator,

                ".ef-withdrawal-rate"

            );

            if (

                isNaN(currentCapital) ||

                isNaN(annualExpenses) ||

                isNaN(monthlySavings) ||

                isNaN(annualReturn) ||

                isNaN(withdrawalRate) ||

                currentCapital < 0 ||

                annualExpenses <= 0 ||

                monthlySavings < 0 ||

                annualReturn < 0 ||

                withdrawalRate <= 0

            ) return null;

            const result = EF.financialIndependence(

                currentCapital,

                annualExpenses,

                monthlySavings,

                annualReturn,

                withdrawalRate

            );

            return {

                chart: result,

                display: function (calculator) {

                    calculator.querySelector(

                        ".ef-fi-target"

                    ).textContent = EF.formatCurrency(result.target);

                    calculator.querySelector(

                        ".ef-fi-years"

                    ).textContent =

                        result.years.toLocaleString("es-ES", {

                            minimumFractionDigits: 1,

                            maximumFractionDigits: 1

                        }) + " años";

                    calculator.querySelector(

                        ".ef-fi-savings"

                    ).textContent = EF.formatCurrency(monthlySavings);

                },

                datasets: [

                    line(

                        "Patrimonio acumulado",

                        result.annualData.map(function (item) {

                            return item.capital;

                        }),

                        "#3E5A3C",

                        3

                    ),

                    line(

                        "Capital objetivo",

                        result.annualData.map(function (item) {

                            return item.target;

                        }),

                        "#BC6B4A",

                        2

                    )

                ]

            };

        }

    );

    setupCalculator(

        ".ef-emergency-fund-calculator",

        function (calculator) {

            const monthlyExpenses = getValue(

                calculator,

                ".ef-monthly-expenses"

            );

            const coverageMonths = getValue(

                calculator,

                ".ef-coverage-months"

            );

            const currentSavings = getValue(

                calculator,

                ".ef-current-savings"

            );

            const monthlyContribution = getValue(

                calculator,

                ".ef-monthly-contribution"

            );

            if (

                isNaN(monthlyExpenses) ||

                isNaN(coverageMonths) ||

                isNaN(currentSavings) ||

                isNaN(monthlyContribution) ||

                monthlyExpenses <= 0 ||

                coverageMonths <= 0 ||

                currentSavings < 0 ||

                monthlyContribution < 0

            ) return null;

            const result = EF.emergencyFund(

                monthlyExpenses,

                coverageMonths,

                currentSavings,

                monthlyContribution

            );

            return {

                chart: result,

                display: function (calculator) {

                    calculator.querySelector(

                        ".ef-emergency-target"

                    ).textContent = EF.formatCurrency(result.target);

                    calculator.querySelector(

                        ".ef-emergency-remaining"

                    ).textContent = EF.formatCurrency(result.remaining);

                    calculator.querySelector(

                        ".ef-emergency-time"

                    ).textContent =

                        result.remaining === 0

                            ? "Objetivo alcanzado"

                            : monthlyContribution === 0

                                ? "—"

                                : result.months + " meses";

                },

                datasets: [

                    line(

                        "Fondo acumulado",

                        result.annualData.map(function (item) {

                            return item.capital;

                        }),

                        "#3E5A3C",

                        3

                    ),

                    line(

                        "Fondo recomendado",

                        result.annualData.map(function (item) {

                            return item.target;

                        }),

                        "#BC6B4A",

                        2

                    )

                ]

            };

        }

    );

    setupCalculator(

        ".ef-retirement-calculator",

        function (calculator) {

            const currentAge = getValue(

                calculator,

                ".ef-current-age"

            );

            const retirementAge = getValue(

                calculator,

                ".ef-retirement-age"

            );

            const currentSavings = getValue(

                calculator,

                ".ef-current-savings"

            );

            const monthlyContribution = getValue(

                calculator,

                ".ef-monthly-contribution"

            );

            const realReturn = getValue(

                calculator,

                ".ef-real-return"

            );

            const monthlyIncome = getValue(

                calculator,

                ".ef-retirement-income"

            );

            const retirementYears = getValue(

                calculator,

                ".ef-retirement-years"

            );

            if (

                isNaN(currentAge) ||

                isNaN(retirementAge) ||

                isNaN(currentSavings) ||

                isNaN(monthlyContribution) ||

                isNaN(realReturn) ||

                isNaN(monthlyIncome) ||

                isNaN(retirementYears) ||

                currentAge < 18 ||

                retirementAge <= currentAge ||

                currentSavings < 0 ||

                monthlyContribution < 0 ||

                realReturn < 0 ||

                monthlyIncome <= 0 ||

                retirementYears <= 0

            ) return null;

            const result = EF.retirement(

                currentAge,

                retirementAge,

                currentSavings,

                monthlyContribution,

                realReturn,

                monthlyIncome,

                retirementYears

            );

            return {

                chart: result,

                display: function (calculator) {

                    calculator.querySelector(

                        ".ef-retirement-target"

                    ).textContent = EF.formatCurrency(result.target);

                    calculator.querySelector(

                        ".ef-retirement-projected"

                    ).textContent = EF.formatCurrency(result.projected);

                    calculator.querySelector(

                        ".ef-retirement-difference"

                    ).textContent = EF.formatCurrency(

                        result.difference

                    );

                },

                datasets: [

                    line(

                        "Capital proyectado",

                        result.annualData.map(function (item) {

                            return item.capital;

                        }),

                        "#3E5A3C",

                        3

                    ),

                    line(

                        "Capital necesario",

                        result.annualData.map(function (item) {

                            return item.target;

                        }),

                        "#BC6B4A",

                        2

                    )

                ]

            };

        }

    );

    document.querySelectorAll(".ef-calculator").forEach(function (calculator) {

        EF.setupSharing(

            calculator,

            function () {

                return "He calculado mi resultado financiero en el Vademécum Financiero.";

            }

        );

    });

})();
