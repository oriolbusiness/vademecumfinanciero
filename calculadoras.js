(function () {

    "use strict";

    window.EF = window.EF || {};

    const CURRENCY = {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    };

    EF.formatCurrency = value =>
        Number(value).toLocaleString("es-ES", CURRENCY);

    EF.parseNumber = input => {

        if (!input) return NaN;

        let value = input.value.trim();

        const percentage = [

            "ef-rate",
            "ef-annual-return",
            "ef-withdrawal-rate",
            "ef-real-return"

        ].some(className =>
            input.classList.contains(className)
        );

        if (percentage) {

            value = value.replace(",", ".");

        } else {

            value = value.replace(/\./g, "");

        }

        return parseFloat(value);

    };

    EF.formatInput = (value, input) => {

        const percentage = [

            "ef-rate",
            "ef-annual-return",
            "ef-withdrawal-rate",
            "ef-real-return"

        ].some(className =>
            input.classList.contains(className)
        );

        if (percentage) {

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

    EF.setupInputs = calculator => {

        calculator.querySelectorAll(".ef-input").forEach(input => {

            if (input.tagName === "SELECT") return;

            input.addEventListener("input", function () {

                const position = this.selectionStart;

                const oldLength = this.value.length;

                this.value = EF.formatInput(

                    this.value,

                    this

                );

                const newLength = this.value.length;

                this.setSelectionRange(

                    position + newLength - oldLength,

                    position + newLength - oldLength

                );

            });

        });

    };

    EF.showError = calculator => {

        const error = calculator.querySelector(".ef-error");

        if (!error) return;

        error.textContent =

            "Introduce valores válidos para realizar el cálculo.";

        error.style.display = "block";

    };

    EF.hideAll = calculator => {

        [

            ".ef-error",
            ".ef-results",
            ".ef-chart",
            ".ef-share",
            ".ef-reset"

        ].forEach(selector => {

            const element = calculator.querySelector(selector);

            if (element) {

                element.style.display = "none";

            }

        });

    };

    EF.showResults = calculator => {

        calculator.querySelector(".ef-results").style.display = "grid";

        calculator.querySelector(".ef-chart").style.display = "block";

        calculator.querySelector(".ef-share").style.display = "block";

        calculator.querySelector(".ef-reset").style.display = "block";

    };

    EF.setupReset = calculator => {

        const reset = calculator.querySelector(".ef-reset");

        if (!reset) return;

        reset.addEventListener("click", () => {

            calculator.querySelectorAll("input").forEach(input => {

                input.value = "";

            });

            calculator.querySelectorAll("select").forEach(select => {

                select.selectedIndex = 0;

            });

            EF.hideAll(calculator);

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

    EF.createChart = (calculator, result, datasets) => {

        const canvas = calculator.querySelector(

            ".ef-chart-canvas"

        );

        if (!canvas || typeof Chart === "undefined") return;

        if (calculator._efChart) {

            calculator._efChart.destroy();

        }

        calculator._efChart = new Chart(canvas, {

            type: "line",

            data: {

                labels: result.annualData.map(item => item.year),

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

                            label: context =>

                                context.dataset.label +

                                ": " +

                                EF.formatCurrency(

                                    context.parsed.y

                                )

                        }

                    }

                },

                scales: {

                    x: {

                        title: {

                            display: true,

                            text: "Años"

                        }

                    },

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback: value =>

                                EF.formatCurrency(value)

                        }

                    }

                }

            }

        });

    };

    EF.setupSharing = calculator => {

        const text = () =>

            "He calculado mi resultado financiero en el Vademécum Financiero.";

        const open = url => window.open(url, "_blank");

        const whatsapp = calculator.querySelector(

            ".ef-share-whatsapp"

        );

        if (whatsapp) {

            whatsapp.onclick = () => open(

                "https://wa.me/?text=" +

                encodeURIComponent(text())

            );

        }

        const telegram = calculator.querySelector(

            ".ef-share-telegram"

        );

        if (telegram) {

            telegram.onclick = () => open(

                "https://t.me/share/url?url=" +

                encodeURIComponent(location.href) +

                "&text=" +

                encodeURIComponent(text())

            );

        }

        const facebook = calculator.querySelector(

            ".ef-share-facebook"

        );

        if (facebook) {

            facebook.onclick = () => open(

                "https://www.facebook.com/sharer/sharer.php?u=" +

                encodeURIComponent(location.href)

            );

        }

        const x = calculator.querySelector(".ef-share-x");

        if (x) {

            x.onclick = () => open(

                "https://twitter.com/intent/tweet?text=" +

                encodeURIComponent(text()) +

                "&url=" +

                encodeURIComponent(location.href)

            );

        }

        const copy = calculator.querySelector(".ef-share-copy");

        if (copy) {

            copy.onclick = async () => {

                const feedback = calculator.querySelector(

                    ".ef-share-feedback"

                );

                try {

                    await navigator.clipboard.writeText(text());

                    if (feedback) {

                        feedback.textContent =

                            "Resultado copiado al portapapeles.";

                    }

                } catch {

                    if (feedback) {

                        feedback.textContent =

                            "No se ha podido copiar el resultado.";

                    }

                }

            };

        }

    };

    EF.compound = (

        capital,

        monthly,

        rate,

        years,

        frequency

    ) => {

        let balance = capital;

        let interestTotal = 0;

        const months = years * 12;

        const periodMonths = 12 / frequency;

        const periodRate = rate / 100 / frequency;

        const annualData = [{

            year: 0,

            invested: capital,

            interest: 0,

            balance: capital

        }];

        for (let month = 1; month <= months; month++) {

            balance += monthly;

            if (month % periodMonths === 0) {

                const interest = balance * periodRate;

                balance += interest;

                interestTotal += interest;

            }

            if (month % 12 === 0) {

                annualData.push({

                    year: month / 12,

                    invested: capital + monthly * month,

                    interest: interestTotal,

                    balance: balance

                });

            }

        }

        return {

            invested: capital + monthly * months,

            interest: interestTotal,

            final: balance,

            annualData: annualData

        };

    };

    EF.simple = (capital, rate, years) => {

        const interest = capital * rate / 100;

        const annualData = [];

        for (let year = 0; year <= years; year++) {

            annualData.push({

                year: year,

                invested: capital,

                interest: interest * year,

                balance: capital + interest * year

            });

        }

        return {

            invested: capital,

            interest: interest * years,

            final: capital + interest * years,

            annualData: annualData

        };

    };

    EF.simpleSavings = (

        capital,

        contribution,

        rate,

        years,

        frequency

    ) => {

        const periods = years * frequency;

        const periodRate = rate / 100 / frequency;

        let invested = capital;

        let interest = capital * rate / 100 * years;

        const annualData = [{

            year: 0,

            invested: capital,

            interest: 0,

            balance: capital

        }];

        for (let period = 1; period <= periods; period++) {

            interest += contribution *

                periodRate *

                (periods - period);

            invested += contribution;

            if (period % frequency === 0) {

                annualData.push({

                    year: period / frequency,

                    invested: invested,

                    interest: interest,

                    balance: invested + interest

                });

            }

        }

        return {

            invested: invested,

            interest: interest,

            final: invested + interest,

            annualData: annualData

        };

    };

    EF.mortgage = (loan, rate, years) => {

        const monthlyRate = rate / 100 / 12;

        const months = years * 12;

        const payment = monthlyRate === 0

            ? loan / months

            : loan *

            (

                monthlyRate *

                Math.pow(1 + monthlyRate, months)

            ) /

            (

                Math.pow(1 + monthlyRate, months) - 1

            );

        let balance = loan;

        let interestTotal = 0;

        const annualData = [{

            year: 0,

            balance: loan,

            interest: 0

        }];

        for (let month = 1; month <= months; month++) {

            const interest = balance * monthlyRate;

            balance -= payment - interest;

            interestTotal += interest;

            if (month % 12 === 0) {

                annualData.push({

                    year: month / 12,

                    balance: Math.max(balance, 0),

                    interest: interestTotal

                });

            }

        }

        return {

            monthlyPayment: payment,

            totalInterest: interestTotal,

            totalPaid: loan + interestTotal,

            annualData: annualData

        };

    };

    EF.financialIndependence = (

        capital,

        expenses,

        savings,

        returnRate,

        withdrawalRate

    ) => {

        const target = expenses / (withdrawalRate / 100);

        const monthlyReturn =

            Math.pow(1 + returnRate / 100, 1 / 12) - 1;

        let current = capital;

        let months = 0;

        const annualData = [{

            year: 0,

            capital: current,

            target: target

        }];

        while (current < target && months < 1200) {

            current =

                current * (1 + monthlyReturn) +

                savings;

            months++;

            if (months % 12 === 0) {

                annualData.push({

                    year: months / 12,

                    capital: current,

                    target: target

                });

            }

        }

        return {

            target: target,

            years: months / 12,

            annualData: annualData

        };

    };

    EF.emergencyFund = (

        expenses,

        monthsTarget,

        savings,

        contribution

    ) => {

        const target = expenses * monthsTarget;

        const remaining = Math.max(target - savings, 0);

        let current = savings;

        let months = 0;

        const annualData = [{

            year: 0,

            capital: current,

            target: target

        }];

        while (

            current < target &&

            contribution > 0 &&

            months < 1200

        ) {

            current += contribution;

            months++;

            if (months % 12 === 0) {

                annualData.push({

                    year: months / 12,

                    capital: Math.min(current, target),

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

    EF.retirement = (

        currentAge,

        retirementAge,

        savings,

        contribution,

        returnRate,

        income,

        retirementYears

    ) => {

        const years = retirementAge - currentAge;

        const monthlyRate =

            Math.pow(1 + returnRate / 100, 1 / 12) - 1;

        const months = retirementYears * 12;

        const target = monthlyRate === 0

            ? income * months

            : income *

            (

                1 -

                Math.pow(1 + monthlyRate, -months)

            ) /

            monthlyRate;

        let current = savings;

        const annualData = [{

            year: 0,

            capital: current,

            target: target

        }];

        for (let month = 1; month <= years * 12; month++) {

            current =

                current * (1 + monthlyRate) +

                contribution;

            if (month % 12 === 0) {

                annualData.push({

                    year: month / 12,

                    capital: current,

                    target: target

                });

            }

        }

        return {

            target: target,

            projected: current,

            difference: current - target,

            annualData: annualData

        };

    };

    const value = (calculator, selector) =>

        EF.parseNumber(

            calculator.querySelector(selector)

        );

    const line = (label, data, color, width) => ({

        label: label,

        data: data,

        borderColor: color,

        borderWidth: width,

        pointRadius: 0,

        pointHoverRadius: 5,

        pointHitRadius: 12,

        tension: 0.25,

        fill: false

    });

    function setup(selector, calculate) {

        document.querySelectorAll(selector).forEach(calculator => {

            EF.setupInputs(calculator);

            EF.setupReset(calculator);

            EF.setupSharing(calculator);

            const button = calculator.querySelector(".ef-button");

            if (!button) return;

            button.addEventListener("click", () => {

                EF.hideAll(calculator);

                const result = calculate(calculator);

                if (!result) {

                    EF.showError(calculator);

                    return;

                }

                calculator.querySelector(

                    ".ef-error"

                ).style.display = "none";

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

    setup(

        ".ef-interest-calculator",

        calculator => {

            const result = EF.compound(

                value(calculator, ".ef-capital"),

                value(calculator, ".ef-monthly"),

                value(calculator, ".ef-rate"),

                value(calculator, ".ef-years"),

                parseInt(

                    calculator.querySelector(

                        ".ef-frequency"

                    ).value

                )

            );

            if (

                !Number.isFinite(result.final) ||

                value(calculator, ".ef-capital") < 0 ||

                value(calculator, ".ef-monthly") < 0 ||

                value(calculator, ".ef-rate") < 0 ||

                value(calculator, ".ef-years") <= 0

            ) return null;

            return {

                chart: result,

                display: calculator => {

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

                        result.annualData.map(x => x.invested),

                        "#8AAE6D",

                        2

                    ),

                    line(

                        "Intereses generados",

                        result.annualData.map(x => x.interest),

                        "#BC6B4A",

                        2

                    ),

                    line(

                        "Capital total",

                        result.annualData.map(x => x.balance),

                        "#3E5A3C",

                        3

                    )

                ]

            };

        }

    );

    setup(

        ".ef-simple-interest-calculator",

        calculator => {

            const capital = value(calculator, ".ef-capital");

            const rate = value(calculator, ".ef-rate");

            const years = value(calculator, ".ef-years");

            if (

                !Number.isFinite(capital) ||

                !Number.isFinite(rate) ||

                !Number.isFinite(years) ||

                capital < 0 ||

                rate < 0 ||

                years <= 0

            ) return null;

            const result = EF.simple(capital, rate, years);

            return {

                chart: result,

                display: calculator => {

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

                        result.annualData.map(x => x.invested),

                        "#8AAE6D",

                        2

                    ),

                    line(

                        "Intereses generados",

                        result.annualData.map(x => x.interest),

                        "#BC6B4A",

                        2

                    ),

                    line(

                        "Capital total",

                        result.annualData.map(x => x.balance),

                        "#3E5A3C",

                        3

                    )

                ]

            };

        }

    );

    setup(

        ".ef-simple-savings-calculator",

        calculator => {

            const capital = value(calculator, ".ef-capital");

            const contribution = value(

                calculator,

                ".ef-contribution"

            );

            const rate = value(calculator, ".ef-rate");

            const years = value(calculator, ".ef-years");

            const frequency = parseInt(

                calculator.querySelector(

                    ".ef-frequency"

                ).value

            );

            if (

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

                display: calculator => {

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

                        result.annualData.map(x => x.invested),

                        "#8AAE6D",

                        2

                    ),

                    line(

                        "Intereses generados",

                        result.annualData.map(x => x.interest),

                        "#BC6B4A",

                        2

                    ),

                    line(

                        "Capital total",

                        result.annualData.map(x => x.balance),

                        "#3E5A3C",

                        3

                    )

                ]

            };

        }

    );

    setup(

        ".ef-mortgage-calculator",

        calculator => {

            const loan = value(calculator, ".ef-loan");

            const rate = value(calculator, ".ef-rate");

            const years = value(calculator, ".ef-years");

            if (

                loan <= 0 ||

                rate < 0 ||

                years <= 0

            ) return null;

            const result = EF.mortgage(loan, rate, years);

            return {

                chart: result,

                display: calculator => {

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

                        result.annualData.map(x => x.balance),

                        "#3E5A3C",

                        3

                    ),

                    line(

                        "Intereses acumulados",

                        result.annualData.map(x => x.interest),

                        "#BC6B4A",

                        2

                    )

                ]

            };

        }

    );

    setup(

        ".ef-financial-independence-calculator",

        calculator => {

            const result = EF.financialIndependence(

                value(calculator, ".ef-current-capital"),

                value(calculator, ".ef-annual-expenses"),

                value(calculator, ".ef-monthly-savings"),

                value(calculator, ".ef-annual-return"),

                value(calculator, ".ef-withdrawal-rate")

            );

            if (!Number.isFinite(result.target)) return null;

            return {

                chart: result,

                display: calculator => {

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

                    ).textContent = EF.formatCurrency(

                        value(calculator, ".ef-monthly-savings")

                    );

                },

                datasets: [

                    line(

                        "Patrimonio acumulado",

                        result.annualData.map(x => x.capital),

                        "#3E5A3C",

                        3

                    ),

                    line(

                        "Capital objetivo",

                        result.annualData.map(x => x.target),

                        "#BC6B4A",

                        2

                    )

                ]

            };

        }

    );

    setup(

        ".ef-emergency-fund-calculator",

        calculator => {

            const contribution = value(

                calculator,

                ".ef-monthly-contribution"

            );

            const result = EF.emergencyFund(

                value(calculator, ".ef-monthly-expenses"),

                value(calculator, ".ef-coverage-months"),

                value(calculator, ".ef-current-savings"),

                contribution

            );

            if (!Number.isFinite(result.target)) return null;

            return {

                chart: result,

                display: calculator => {

                    calculator.querySelector(

                        ".ef-emergency-target"

                    ).textContent = EF.formatCurrency(result.target);

                    calculator.querySelector(

                        ".ef-emergency-remaining"

                    ).textContent = EF.formatCurrency(

                        result.remaining

                    );

                    calculator.querySelector(

                        ".ef-emergency-time"

                    ).textContent =

                        result.remaining === 0

                            ? "Objetivo alcanzado"

                            : contribution === 0

                                ? "—"

                                : result.months + " meses";

                },

                datasets: [

                    line(

                        "Fondo acumulado",

                        result.annualData.map(x => x.capital),

                        "#3E5A3C",

                        3

                    ),

                    line(

                        "Fondo recomendado",

                        result.annualData.map(x => x.target),

                        "#BC6B4A",

                        2

                    )

                ]

            };

        }

    );

    setup(

        ".ef-retirement-calculator",

        calculator => {

            const result = EF.retirement(

                value(calculator, ".ef-current-age"),

                value(calculator, ".ef-retirement-age"),

                value(calculator, ".ef-current-savings"),

                value(calculator, ".ef-monthly-contribution"),

                value(calculator, ".ef-real-return"),

                value(calculator, ".ef-retirement-income"),

                value(calculator, ".ef-retirement-years")

            );

            if (!Number.isFinite(result.target)) return null;

            return {

                chart: result,

                display: calculator => {

                    calculator.querySelector(

                        ".ef-retirement-target"

                    ).textContent = EF.formatCurrency(result.target);

                    calculator.querySelector(

                        ".ef-retirement-projected"

                    ).textContent = EF.formatCurrency(

                        result.projected

                    );

                    calculator.querySelector(

                        ".ef-retirement-difference"

                    ).textContent = EF.formatCurrency(

                        result.difference

                    );

                },

                datasets: [

                    line(

                        "Capital proyectado",

                        result.annualData.map(x => x.capital),

                        "#3E5A3C",

                        3

                    ),

                    line(

                        "Capital necesario",

                        result.annualData.map(x => x.target),

                        "#BC6B4A",

                        2

                    )

                ]

            };

        }

    );

})();
