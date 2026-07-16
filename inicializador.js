(function () {

    "use strict";

    function getValue(calculator, selector) {

        return EF.parseNumber(

            calculator.querySelector(selector)

        );

    }

    function showError(calculator) {

        EF.showError(calculator);

        calculator.querySelector(

            ".ef-results"

        ).style.display = "none";

        calculator.querySelector(

            ".ef-chart"

        ).style.display = "none";

        calculator.querySelector(

            ".ef-share"

        ).style.display = "none";

        calculator.querySelector(

            ".ef-reset"

        ).style.display = "none";

    }

    function setupCalculator(

        selector,

        calculate

    ) {

        document

            .querySelectorAll(selector)

            .forEach(function (calculator) {

                EF.setupInputs(calculator);

                EF.setupReset(calculator);

                calculator.querySelector(

                    ".ef-button"

                ).addEventListener(

                    "click",

                    function () {

                        const result = calculate(

                            calculator

                        );

                        if (!result) {

                            showError(calculator);

                            return;

                        }

                        calculator.querySelector(

                            ".ef-error"

                        ).style.display = "none";

                        EF.showResults(

                            calculator

                        );

                        result.display(

                            calculator

                        );

                        EF.createChart(

                            calculator,

                            result.chart,

                            result.datasets

                        );

                    }

                );

            });

    }

    setupCalculator(

        ".ef-interest-calculator",

        function (calculator) {

            const capital = getValue(

                calculator,

                ".ef-capital"

            );

            const monthly = getValue(

                calculator,

                ".ef-monthly"

            );

            const rate = getValue(

                calculator,

                ".ef-rate"

            );

            const years = getValue(

                calculator,

                ".ef-years"

            );

            const frequency = parseInt(

                calculator.querySelector(

                    ".ef-frequency"

                ).value

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

            ) {

                return null;

            }

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

                    ).textContent =

                        EF.formatCurrency(

                            result.invested

                        );

                    calculator.querySelector(

                        ".ef-total-interest"

                    ).textContent =

                        EF.formatCurrency(

                            result.interest

                        );

                    calculator.querySelector(

                        ".ef-final-balance"

                    ).textContent =

                        EF.formatCurrency(

                            result.final

                        );

                },

                datasets: [

                    {

                        label: "Capital aportado",

                        data: result.annualData.map(

                            function (item) {

                                return item.invested;

                            }

                        ),

                        borderColor: "#8AAE6D",

                        borderWidth: 2,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    },

                    {

                        label: "Intereses generados",

                        data: result.annualData.map(

                            function (item) {

                                return item.interest;

                            }

                        ),

                        borderColor: "#BC6B4A",

                        borderWidth: 2,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    },

                    {

                        label: "Capital total",

                        data: result.annualData.map(

                            function (item) {

                                return item.balance;

                            }

                        ),

                        borderColor: "#3E5A3C",

                        borderWidth: 3,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    }

                ]

            };

        }

    );

    setupCalculator(

        ".ef-simple-interest-calculator",

        function (calculator) {

            const capital = getValue(

                calculator,

                ".ef-capital"

            );

            const rate = getValue(

                calculator,

                ".ef-rate"

            );

            const years = getValue(

                calculator,

                ".ef-years"

            );

            if (

                isNaN(capital) ||

                isNaN(rate) ||

                isNaN(years) ||

                capital < 0 ||

                rate < 0 ||

                years <= 0

            ) {

                return null;

            }

            const result = EF.simple(

                capital,

                rate,

                years

            );

            return {

                chart: result,

                display: function (calculator) {

                    calculator.querySelector(

                        ".ef-total-invested"

                    ).textContent =

                        EF.formatCurrency(

                            result.invested

                        );

                    calculator.querySelector(

                        ".ef-total-interest"

                    ).textContent =

                        EF.formatCurrency(

                            result.interest

                        );

                    calculator.querySelector(

                        ".ef-final-balance"

                    ).textContent =

                        EF.formatCurrency(

                            result.final

                        );

                },

                datasets: [

                    {

                        label: "Capital inicial",

                        data: result.annualData.map(

                            function (item) {

                                return item.invested;

                            }

                        ),

                        borderColor: "#8AAE6D",

                        borderWidth: 2,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    },

                    {

                        label: "Intereses generados",

                        data: result.annualData.map(

                            function (item) {

                                return item.interest;

                            }

                        ),

                        borderColor: "#BC6B4A",

                        borderWidth: 2,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    },

                    {

                        label: "Capital total",

                        data: result.annualData.map(

                            function (item) {

                                return item.balance;

                            }

                        ),

                        borderColor: "#3E5A3C",

                        borderWidth: 3,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    }

                ]

            };

        }

    );

    setupCalculator(

        ".ef-simple-savings-calculator",

        function (calculator) {

            const capital = getValue(

                calculator,

                ".ef-capital"

            );

            const contribution = getValue(

                calculator,

                ".ef-contribution"

            );

            const rate = getValue(

                calculator,

                ".ef-rate"

            );

            const years = getValue(

                calculator,

                ".ef-years"

            );

            const frequency = parseInt(

                calculator.querySelector(

                    ".ef-frequency"

                ).value

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

            ) {

                return null;

            }

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

                    ).textContent =

                        EF.formatCurrency(

                            result.invested

                        );

                    calculator.querySelector(

                        ".ef-total-interest"

                    ).textContent =

                        EF.formatCurrency(

                            result.interest

                        );

                    calculator.querySelector(

                        ".ef-final-balance"

                    ).textContent =

                        EF.formatCurrency(

                            result.final

                        );

                },

                datasets: [

                    {

                        label: "Capital aportado",

                        data: result.annualData.map(

                            function (item) {

                                return item.invested;

                            }

                        ),

                        borderColor: "#8AAE6D",

                        borderWidth: 2,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    },

                    {

                        label: "Intereses generados",

                        data: result.annualData.map(

                            function (item) {

                                return item.interest;

                            }

                        ),

                        borderColor: "#BC6B4A",

                        borderWidth: 2,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    },

                    {

                        label: "Capital total",

                        data: result.annualData.map(

                            function (item) {

                                return item.balance;

                            }

                        ),

                        borderColor: "#3E5A3C",

                        borderWidth: 3,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    }

                ]

            };

        }

    );

    setupCalculator(

        ".ef-mortgage-calculator",

        function (calculator) {

            const loan = getValue(

                calculator,

                ".ef-loan"

            );

            const rate = getValue(

                calculator,

                ".ef-rate"

            );

            const years = getValue(

                calculator,

                ".ef-years"

            );

            if (

                isNaN(loan) ||

                isNaN(rate) ||

                isNaN(years) ||

                loan <= 0 ||

                rate < 0 ||

                years <= 0

            ) {

                return null;

            }

            const result = EF.mortgage(

                loan,

                rate,

                years

            );

            return {

                chart: result,

                display: function (calculator) {

                    calculator.querySelector(

                        ".ef-monthly-payment"

                    ).textContent =

                        EF.formatCurrency(

                            result.monthlyPayment

                        );

                    calculator.querySelector(

                        ".ef-total-interest"

                    ).textContent =

                        EF.formatCurrency(

                            result.totalInterest

                        );

                    calculator.querySelector(

                        ".ef-total-paid"

                    ).textContent =

                        EF.formatCurrency(

                            result.totalPaid

                        );

                },

                datasets: [

                    {

                        label: "Deuda pendiente",

                        data: result.annualData.map(

                            function (item) {

                                return item.balance;

                            }

                        ),

                        borderColor: "#3E5A3C",

                        borderWidth: 3,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    },

                    {

                        label: "Intereses acumulados",

                        data: result.annualData.map(

                            function (item) {

                                return item.interest;

                            }

                        ),

                        borderColor: "#BC6B4A",

                        borderWidth: 2,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    }

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

            ) {

                return null;

            }

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

                    ).textContent =

                        EF.formatCurrency(

                            result.target

                        );

                    calculator.querySelector(

                        ".ef-fi-years"

                    ).textContent =

                        result.years.toLocaleString(

                            "es-ES",

                            {

                                minimumFractionDigits: 1,

                                maximumFractionDigits: 1

                            }

                        ) + " años";

                    calculator.querySelector(

                        ".ef-fi-savings"

                    ).textContent =

                        EF.formatCurrency(

                            monthlySavings

                        );

                },

                datasets: [

                    {

                        label: "Patrimonio acumulado",

                        data: result.annualData.map(

                            function (item) {

                                return item.capital;

                            }

                        ),

                        borderColor: "#3E5A3C",

                        borderWidth: 3,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    },

                    {

                        label: "Capital objetivo",

                        data: result.annualData.map(

                            function (item) {

                                return item.target;

                            }

                        ),

                        borderColor: "#BC6B4A",

                        borderWidth: 2,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    }

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

            ) {

                return null;

            }

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

                    ).textContent =

                        EF.formatCurrency(

                            result.target

                        );

                    calculator.querySelector(

                        ".ef-emergency-remaining"

                    ).textContent =

                        EF.formatCurrency(

                            result.remaining

                        );

                    if (result.remaining === 0) {

                        calculator.querySelector(

                            ".ef-emergency-time"

                        ).textContent =

                            "Objetivo alcanzado";

                    } else if (

                        monthlyContribution === 0

                    ) {

                        calculator.querySelector(

                            ".ef-emergency-time"

                        ).textContent = "—";

                    } else {

                        calculator.querySelector(

                            ".ef-emergency-time"

                        ).textContent =

                            result.months + " meses";

                    }

                },

                datasets: [

                    {

                        label: "Fondo acumulado",

                        data: result.annualData.map(

                            function (item) {

                                return item.capital;

                            }

                        ),

                        borderColor: "#3E5A3C",

                        borderWidth: 3,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    },

                    {

                        label: "Fondo recomendado",

                        data: result.annualData.map(

                            function (item) {

                                return item.target;

                            }

                        ),

                        borderColor: "#BC6B4A",

                        borderWidth: 2,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    }

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

            ) {

                return null;

            }

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

                    ).textContent =

                        EF.formatCurrency(

                            result.target

                        );

                    calculator.querySelector(

                        ".ef-retirement-projected"

                    ).textContent =

                        EF.formatCurrency(

                            result.projected

                        );

                    calculator.querySelector(

                        ".ef-retirement-difference"

                    ).textContent =

                        EF.formatCurrency(

                            result.difference

                        );

                },

                datasets: [

                    {

                        label: "Capital proyectado",

                        data: result.annualData.map(

                            function (item) {

                                return item.capital;

                            }

                        ),

                        borderColor: "#3E5A3C",

                        borderWidth: 3,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    },

                    {

                        label: "Capital necesario",

                        data: result.annualData.map(

                            function (item) {

                                return item.target;

                            }

                        ),

                        borderColor: "#BC6B4A",

                        borderWidth: 2,

                        pointRadius: 0,

                        pointHoverRadius: 5,

                        pointHitRadius: 12,

                        tension: 0.25,

                        fill: false

                    }

                ]

            };

        }

    );

    document

        .querySelectorAll(".ef-calculator")

        .forEach(function (calculator) {

            EF.setupSharing(

                calculator,

                function () {

                    return (

                        "He calculado mi resultado financiero en el Vademécum Financiero."

                    );

                }

            );

        });

})();
