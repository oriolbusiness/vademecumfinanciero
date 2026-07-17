(function () {

    "use strict";

    window.EF = window.EF || {};

    EF.formatCurrency = function (value) {

        return value.toLocaleString("es-ES", {

            style: "currency",

            currency: "EUR",

            minimumFractionDigits: 0,

            maximumFractionDigits: 0

        });

    };

    EF.parseNumber = function (input) {

        let value = input.value.trim();

        if (

            input.classList.contains("ef-rate") ||

            input.classList.contains("ef-annual-return") ||

            input.classList.contains("ef-withdrawal-rate") ||

            input.classList.contains("ef-real-return")

        ) {

            value = value.replace(",", ".");

        } else {

            value = value.replace(/\./g, "");

        }

        return parseFloat(value);

    };

    EF.formatInput = function (value, input) {

        if (

            input.classList.contains("ef-rate") ||

            input.classList.contains("ef-annual-return") ||

            input.classList.contains("ef-withdrawal-rate") ||

            input.classList.contains("ef-real-return")

        ) {

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

        if (!clean) {

            return "";

        }

        return clean.replace(

            /\B(?=(\d{3})+(?!\d))/g,

            "."

        );

    };

    EF.setupInputs = function (calculator) {

        calculator.querySelectorAll(

            ".ef-input"

        ).forEach(function (input) {

            if (input.tagName === "SELECT") {

                return;

            }

            input.addEventListener(

                "input",

                function () {

                    const cursorPosition =

                        this.selectionStart;

                    const originalLength =

                        this.value.length;

                    this.value = EF.formatInput(

                        this.value,

                        this

                    );

                    const newLength =

                        this.value.length;

                    const newCursorPosition =

                        cursorPosition +

                        (

                            newLength -

                            originalLength

                        );

                    this.setSelectionRange(

                        newCursorPosition,

                        newCursorPosition

                    );

                }

            );

        });

    };

    EF.showError = function (calculator) {

        const error = calculator.querySelector(

            ".ef-error"

        );

        error.textContent =

            "Introduce valores válidos para realizar el cálculo.";

        error.style.display = "block";

    };

    EF.showResults = function (calculator) {

        calculator.querySelector(

            ".ef-results"

        ).style.display = "grid";

        calculator.querySelector(

            ".ef-chart"

        ).style.display = "block";

        calculator.querySelector(

            ".ef-share"

        ).style.display = "block";

        calculator.querySelector(

            ".ef-reset"

        ).style.display = "block";

    };

    EF.setupReset = function (calculator) {

        const reset = calculator.querySelector(

            ".ef-reset"

        );

        reset.addEventListener(

            "click",

            function () {

                calculator.querySelectorAll(

                    "input"

                ).forEach(function (input) {

                    input.value = "";

                });

                calculator.querySelectorAll(

                    "select"

                ).forEach(function (select) {

                    select.selectedIndex = 0;

                });

                calculator.querySelector(

                    ".ef-error"

                ).style.display = "none";

                calculator.querySelector(

                    ".ef-results"

                ).style.display = "none";

                calculator.querySelector(

                    ".ef-chart"

                ).style.display = "none";

                calculator.querySelector(

                    ".ef-share"

                ).style.display = "none";

                reset.style.display = "none";

                if (calculator._efChart) {

                    calculator._efChart.destroy();

                    calculator._efChart = null;

                }

                calculator.querySelector(

                    ".ef-share-feedback"

                ).textContent = "";

            }

        );

    };

    EF.setupSharing = function (

        calculator,

        getShareText

    ) {

        const feedback = calculator.querySelector(

            ".ef-share-feedback"

        );

        calculator.querySelector(

            ".ef-share-whatsapp"

        ).addEventListener(

            "click",

            function () {

                window.open(

                    "https://wa.me/?text=" +

                    encodeURIComponent(

                        getShareText()

                    ),

                    "_blank"

                );

            }

        );

        calculator.querySelector(

            ".ef-share-telegram"

        ).addEventListener(

            "click",

            function () {

                window.open(

                    "https://t.me/share/url?url=" +

                    encodeURIComponent(

                        window.location.href

                    ) +

                    "&text=" +

                    encodeURIComponent(

                        getShareText()

                    ),

                    "_blank"

                );

            }

        );

        calculator.querySelector(

            ".ef-share-facebook"

        ).addEventListener(

            "click",

            function () {

                window.open(

                    "https://www.facebook.com/sharer/sharer.php?u=" +

                    encodeURIComponent(

                        window.location.href

                    ),

                    "_blank"

                );

            }

        );

        calculator.querySelector(

            ".ef-share-x"

        ).addEventListener(

            "click",

            function () {

                window.open(

                    "https://twitter.com/intent/tweet?text=" +

                    encodeURIComponent(

                        getShareText()

                    ) +

                    "&url=" +

                    encodeURIComponent(

                        window.location.href

                    ),

                    "_blank"

                );

            }

        );

        calculator.querySelector(

            ".ef-share-copy"

        ).addEventListener(

            "click",

            async function () {

                try {

                    await navigator.clipboard.writeText(

                        getShareText()

                    );

                    feedback.textContent =

                        "Resultado copiado al portapapeles.";

                } catch (error) {

                    feedback.textContent =

                        "No se ha podido copiar el resultado.";

                }

            }

        );

    };

    EF.createChart = function (

        calculator,

        result,

        datasets

    ) {

        const canvas = calculator.querySelector(

            ".ef-chart-canvas"

        );

        if (calculator._efChart) {

            calculator._efChart.destroy();

        }

        const labels = result.annualData.map(

            function (item) {

                return item.year;

            }

        );

        calculator._efChart = new Chart(

            canvas,

            {

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

                                    return EF.formatCurrency(

                                        value

                                    );

                                }

                            }

                        }

                    }

                }

            }

        );

    };

    EF.compound = function (

        capital,

        monthly,

        rate,

        years,

        frequency

    ) {

        let balance = capital;

        const monthsPerPeriod = 12 / frequency;

        const periodRate = rate / 100 / frequency;

        const annualData = [{

            year: 0,

            invested: capital,

            interest: 0,

            balance: capital

        }];

        let totalInterest = 0;

        const totalMonths = years * 12;

        for (

            let month = 1;

            month <= totalMonths;

            month++

        ) {

            balance += monthly;

            if (month % monthsPerPeriod === 0) {

                const interest =

                    balance * periodRate;

                balance += interest;

                totalInterest += interest;

            }

            if (month % 12 === 0) {

                const year = month / 12;

                annualData.push({

                    year: year,

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

    EF.simple = function (

        capital,

        rate,

        years

    ) {

        const annualInterest =

            capital * (rate / 100);

        const annualData = [];

        for (

            let year = 0;

            year <= years;

            year++

        ) {

            const interest =

                annualInterest * year;

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

        const periodsPerYear = frequency;

        const totalPeriods =

            years * periodsPerYear;

        const periodRate =

            rate / 100 / periodsPerYear;

        const annualData = [{

            year: 0,

            invested: capital,

            interest: 0,

            balance: capital

        }];

        let totalInterest =

            capital * (rate / 100) * years;

        let totalInvested = capital;

        for (

            let period = 1;

            period <= totalPeriods;

            period++

        ) {

            const remainingPeriods =

                totalPeriods - period;

            totalInterest +=

                contribution *

                periodRate *

                remainingPeriods;

            totalInvested += contribution;

            if (

                period % periodsPerYear === 0

            ) {

                const year =

                    period / periodsPerYear;

                annualData.push({

                    year: year,

                    invested: totalInvested,

                    interest: totalInterest,

                    balance:

                        totalInvested +

                        totalInterest

                });

            }

        }

        return {

            invested: totalInvested,

            interest: totalInterest,

            final:

                totalInvested +

                totalInterest,

            annualData: annualData

        };

    };

    EF.mortgage = function (

        loan,

        rate,

        years

    ) {

        const monthlyRate =

            rate / 100 / 12;

        const totalMonths = years * 12;

        let monthlyPayment;

        if (monthlyRate === 0) {

            monthlyPayment =

                loan / totalMonths;

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

        for (

            let month = 1;

            month <= totalMonths;

            month++

        ) {

            const interest =

                balance * monthlyRate;

            const principal =

                monthlyPayment - interest;

            balance -= principal;

            totalInterest += interest;

            if (month % 12 === 0) {

                annualData.push({

                    year: month / 12,

                    balance: Math.max(

                        balance,

                        0

                    ),

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

        const maxMonths = 1200;

        while (

            capital < targetCapital &&

            months < maxMonths

        ) {

            capital =

                capital *

                (1 + monthlyReturn) +

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

        const target =

            monthlyExpenses *

            coverageMonths;

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

        if (

            remaining > 0 &&

            monthlyContribution > 0

        ) {

            while (

                capital < target &&

                months < 1200

            ) {

                capital += monthlyContribution;

                months++;

                if (months % 12 === 0) {

                    annualData.push({

                        year: months / 12,

                        capital: Math.min(

                            capital,

                            target

                        ),

                        target: target

                    });

                }

            }

            if (

                months % 12 !== 0 &&

                months < 1200

            ) {

                annualData.push({

                    year: months / 12,

                    capital: Math.min(

                        capital,

                        target

                    ),

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

        const yearsToRetirement =

            retirementAge - currentAge;

        const monthlyRate =

            Math.pow(

                1 + realReturn / 100,

                1 / 12

            ) - 1;

        const totalMonths =

            retirementYears * 12;

        let targetCapital;

        if (monthlyRate === 0) {

            targetCapital =

                monthlyIncome *

                totalMonths;

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

        let projectedCapital =

            currentSavings;

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

            difference:

                projectedCapital - targetCapital,

            yearsToRetirement:

                yearsToRetirement,

            annualData: annualData

        };

    };

})();
