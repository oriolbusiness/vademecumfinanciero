(function () {

  "use strict";

  window.EF = window.EF || {};

  EF.round2 = function (value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {

      return 0;

    }

    return Math.round(
      number * 100
    ) / 100;

  };

  EF.roundObject = function (object) {

    const rounded = {};

    Object.keys(object).forEach(function (key) {

      const value = object[key];

      rounded[key] =
        typeof value === "number"
          ? EF.round2(value)
          : value;

    });

    return rounded;

  };

  EF.roundAnnualData = function (annualData) {

    return annualData.map(function (item) {

      return EF.roundObject(item);

    });

  };

  EF.formatCurrency = function (value) {

    return EF.round2(value).toLocaleString(
      "es-ES",
      {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  };

  EF.parseNumber = function (input) {

    let value =
      input.value.trim();

    value =
      value.replace(/\./g, "");

    return parseFloat(value);

  };

  EF.formatInput = function (value) {

    const clean =
      value.replace(/\D/g, "");

    if (!clean) {

      return "";

    }

    return clean.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      "."
    );

  };

  EF.setupInputs = function (calculator) {

    calculator
      .querySelectorAll(".ef-input")
      .forEach(function (input) {

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

            this.value =
              EF.formatInput(
                this.value
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

    const error =
      calculator.querySelector(
        ".ef-error"
      );

    error.textContent =
      "Introduce valores válidos para realizar el cálculo.";

    error.style.display =
      "block";

  };

  EF.showResults = function (calculator) {

    const buttonGroup =
      calculator.querySelector(
        ".ef-button-group"
      );

    const calculate =
      calculator.querySelector(
        ".ef-button"
      );

    const reset =
      calculator.querySelector(
        ".ef-reset"
      );

    calculator.querySelector(
      ".ef-results"
    ).style.display =
      "grid";

    calculator.querySelector(
      ".ef-chart"
    ).style.display =
      "block";

    calculator.querySelector(
      ".ef-share"
    ).style.display =
      "block";

    if (buttonGroup) {

      buttonGroup.style.display =
        "flex";

      buttonGroup.style.flexDirection =
        "row";

      buttonGroup.style.alignItems =
        "center";

      buttonGroup.style.flexWrap =
        "nowrap";

      buttonGroup.style.gap =
        "12px";

    }

    if (calculate) {

      calculate.style.flex =
        "1 1 auto";

      calculate.style.width =
        "auto";

    }

    if (reset) {

      reset.style.display =
        "inline-flex";

      reset.style.flex =
        "0 0 auto";

      reset.style.width =
        "auto";

    }

  };

  EF.setupReset = function (calculator) {

    const reset =
      calculator.querySelector(
        ".ef-reset"
      );

    if (!reset) {

      return;

    }

    reset.addEventListener(
      "click",
      function () {

        calculator
          .querySelectorAll("input")
          .forEach(function (input) {

            input.value =
              "";

          });

        calculator
          .querySelectorAll("select")
          .forEach(function (select) {

            select.selectedIndex =
              0;

          });

        calculator.querySelector(
          ".ef-error"
        ).style.display =
          "none";

        calculator.querySelector(
          ".ef-results"
        ).style.display =
          "none";

        calculator.querySelector(
          ".ef-chart"
        ).style.display =
          "none";

        calculator.querySelector(
          ".ef-share"
        ).style.display =
          "none";

        reset.style.display =
          "none";

        if (calculator._efChart) {

          calculator._efChart.destroy();

          calculator._efChart =
            null;

        }

        calculator.querySelector(
          ".ef-share-feedback"
        ).textContent =
          "";

      }
    );

  };

  EF.setupSharing = function (
    calculator,
    getShareText
  ) {

    const feedback =
      calculator.querySelector(
        ".ef-share-feedback"
      );

    const whatsapp =
      calculator.querySelector(
        ".ef-share-whatsapp"
      );

    const telegram =
      calculator.querySelector(
        ".ef-share-telegram"
      );

    const facebook =
      calculator.querySelector(
        ".ef-share-facebook"
      );

    const x =
      calculator.querySelector(
        ".ef-share-x"
      );

    const copy =
      calculator.querySelector(
        ".ef-share-copy"
      );

    if (whatsapp) {

      whatsapp.addEventListener(
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

    }

    if (telegram) {

      telegram.addEventListener(
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

    }

    if (facebook) {

      facebook.addEventListener(
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

    }

    if (x) {

      x.addEventListener(
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

    }

    if (copy) {

      copy.addEventListener(
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

    }

  };

  EF.createChart = function (
    calculator,
    result,
    datasets
  ) {

    const canvas =
      calculator.querySelector(
        ".ef-chart-canvas"
      );

    if (!canvas || typeof Chart === "undefined") {

      return;

    }

    if (calculator._efChart) {

      calculator._efChart.destroy();

    }

    const labels =
      result.annualData.map(
        function (item) {

          return item.year;

        }
      );

    calculator._efChart =
      new Chart(
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

    let balance =
      capital;

    const monthsPerPeriod =
      12 / frequency;

    const periodRate =
      rate / 100 / frequency;

    const annualData = [

      {
        year: 0,
        invested: capital,
        interest: 0,
        balance: capital
      }

    ];

    let totalInterest =
      0;

    const totalMonths =
      years * 12;

    for (
      let month = 1;
      month <= totalMonths;
      month++
    ) {

      balance +=
        monthly;

      if (
        month % monthsPerPeriod === 0
      ) {

        const interest =
          balance * periodRate;

        balance +=
          interest;

        totalInterest +=
          interest;

      }

      if (
        month % 12 === 0
      ) {

        const year =
          month / 12;

        annualData.push({

          year: year,

          invested:
            capital +
            monthly * month,

          interest:
            totalInterest,

          balance:
            balance

        });

      }

    }

    return {

      invested:
        EF.round2(
          capital +
          monthly * totalMonths
        ),

      interest:
        EF.round2(
          totalInterest
        ),

      final:
        EF.round2(
          balance
        ),

      annualData:
        EF.roundAnnualData(
          annualData
        )

    };

  };

  EF.simple = function (
    capital,
    rate,
    years
  ) {

    const annualInterest =
      capital * (rate / 100);

    const annualData =
      [];

    for (
      let year = 0;
      year <= years;
      year++
    ) {

      const interest =
        annualInterest * year;

      annualData.push({

        year: year,

        invested:
          capital,

        interest:
          interest,

        balance:
          capital +
          interest

      });

    }

    return {

      invested:
        EF.round2(
          capital
        ),

      interest:
        EF.round2(
          annualInterest * years
        ),

      final:
        EF.round2(
          capital +
          annualInterest * years
        ),

      annualData:
        EF.roundAnnualData(
          annualData
        )

    };

  };

  EF.simpleSavings = function (
    capital,
    contribution,
    rate,
    years,
    frequency
  ) {

    const periodsPerYear =
      frequency;

    const totalPeriods =
      years * periodsPerYear;

    const periodRate =
      rate /
      100 /
      periodsPerYear;

    const annualData = [

      {
        year: 0,
        invested: capital,
        interest: 0,
        balance: capital
      }

    ];

    let totalInterest =
      capital *
      (rate / 100) *
      years;

    let totalInvested =
      capital;

    for (
      let period = 1;
      period <= totalPeriods;
      period++
    ) {

      const remainingPeriods =
        totalPeriods -
        period;

      totalInterest +=
        contribution *
        periodRate *
        remainingPeriods;

      totalInvested +=
        contribution;

      if (
        period % periodsPerYear === 0
      ) {

        const year =
          period /
          periodsPerYear;

        annualData.push({

          year: year,

          invested:
            totalInvested,

          interest:
            totalInterest,

          balance:
            totalInvested +
            totalInterest

        });

      }

    }

    return {

      invested:
        EF.round2(
          totalInvested
        ),

      interest:
        EF.round2(
          totalInterest
        ),

      final:
        EF.round2(
          totalInvested +
          totalInterest
        ),

      annualData:
        EF.roundAnnualData(
          annualData
        )

    };

  };

  EF.mortgage = function (
    loan,
    rate,
    years
  ) {

    const monthlyRate =
      rate /
      100 /
      12;

    const totalMonths =
      years *
      12;

    let monthlyPayment;

    if (
      monthlyRate === 0
    ) {

      monthlyPayment =
        loan /
        totalMonths;

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
          ) -
          1
        );

    }

    let balance =
      loan;

    let totalInterest =
      0;

    const annualData = [

      {
        year: 0,
        balance: loan,
        interest: 0
      }

    ];

    for (
      let month = 1;
      month <= totalMonths;
      month++
    ) {

      const interest =
        balance *
        monthlyRate;

      const principal =
        monthlyPayment -
        interest;

      balance -=
        principal;

      totalInterest +=
        interest;

      if (
        month % 12 === 0
      ) {

        annualData.push({

          year:
            month / 12,

          balance:
            Math.max(
              balance,
              0
            ),

          interest:
            totalInterest

        });

      }

    }

    return {

      monthlyPayment:
        EF.round2(
          monthlyPayment
        ),

      totalInterest:
        EF.round2(
          totalInterest
        ),

      totalPaid:
        EF.round2(
          loan +
          totalInterest
        ),

      annualData:
        EF.roundAnnualData(
          annualData
        )

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
      ) -
      1;

    let capital =
      currentCapital;

    let months =
      0;

    const annualData = [

      {
        year: 0,
        capital: capital,
        target: targetCapital
      }

    ];

    const maxMonths =
      1200;

    while (
      capital < targetCapital &&
      months < maxMonths
    ) {

      capital =
        capital *
        (1 + monthlyReturn) +
        monthlySavings;

      months++;

      if (
        months % 12 === 0
      ) {

        annualData.push({

          year:
            months / 12,

          capital:
            capital,

          target:
            targetCapital

        });

      }

    }

    return {

      target:
        EF.round2(
          targetCapital
        ),

      years:
        EF.round2(
          months / 12
        ),

      capital:
        EF.round2(
          capital
        ),

      annualData:
        EF.roundAnnualData(
          annualData
        )

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

    const remaining =
      Math.max(
        target -
        currentSavings,
        0
      );

    let months =
      0;

    let capital =
      currentSavings;

    const annualData = [

      {
        year: 0,
        capital: capital,
        target: target
      }

    ];

    if (
      remaining > 0 &&
      monthlyContribution > 0
    ) {

      while (
        capital < target &&
        months < 1200
      ) {

        capital +=
          monthlyContribution;

        months++;

        if (
          months % 12 === 0
        ) {

          annualData.push({

            year:
              months / 12,

            capital:
              Math.min(
                capital,
                target
              ),

            target:
              target

          });

        }

      }

      if (
        months % 12 !== 0 &&
        months < 1200
      ) {

        annualData.push({

          year:
            months / 12,

          capital:
            Math.min(
              capital,
              target
            ),

          target:
            target

        });

      }

    }

    return {

      target:
        EF.round2(
          target
        ),

      remaining:
        EF.round2(
          remaining
        ),

      months:
        months,

      annualData:
        EF.roundAnnualData(
          annualData
        )

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
      retirementAge -
      currentAge;

    const monthlyRate =
      Math.pow(
        1 + realReturn / 100,
        1 / 12
      ) -
      1;

    const totalMonths =
      retirementYears *
      12;

    let targetCapital;

    if (
      monthlyRate === 0
    ) {

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

    const annualData = [

      {
        year: 0,
        capital: projectedCapital,
        target: targetCapital
      }

    ];

    for (
      let month = 1;
      month <= yearsToRetirement * 12;
      month++
    ) {

      projectedCapital =
        projectedCapital *
        (1 + monthlyRate) +
        monthlyContribution;

      if (
        month % 12 === 0
      ) {

        annualData.push({

          year:
            month / 12,

          capital:
            projectedCapital,

          target:
            targetCapital

        });

      }

    }

    return {

      target:
        EF.round2(
          targetCapital
        ),

      projected:
        EF.round2(
          projectedCapital
        ),

      difference:
        EF.round2(
          projectedCapital -
          targetCapital
        ),

      yearsToRetirement:
        yearsToRetirement,

      annualData:
        EF.roundAnnualData(
          annualData
        )

    };

  };

  EF.netWorth = function (
    cash,
    investments,
    property,
    otherAssets,
    mortgageDebt,
    loans,
    creditCardDebt,
    otherDebts
  ) {

    const totalAssets =
      cash +
      investments +
      property +
      otherAssets;

    const totalLiabilities =
      mortgageDebt +
      loans +
      creditCardDebt +
      otherDebts;

    const netWorth =
      totalAssets -
      totalLiabilities;

    return {

      assets:
        EF.round2(
          totalAssets
        ),

      liabilities:
        EF.round2(
          totalLiabilities
        ),

      netWorth:
        EF.round2(
          netWorth
        )

    };

  };

  EF.initNetWorthCalculator = function (
    calculator
  ) {

    const calculate =
      calculator.querySelector(
        ".ef-button"
      );

    if (!calculate) {

      return;

    }

    EF.setupInputs(
      calculator
    );

    EF.setupReset(
      calculator
    );

    EF.setupSharing(
      calculator,
      function () {

        const total =
          calculator.querySelector(
            ".ef-net-worth-total"
          ).textContent;

        const assets =
          calculator.querySelector(
            ".ef-net-worth-assets"
          ).textContent;

        const liabilities =
          calculator.querySelector(
            ".ef-net-worth-liabilities"
          ).textContent;

        return (
          "Mi patrimonio neto es de " +
          total +
          ". Activos: " +
          assets +
          ". Deudas: " +
          liabilities +
          "."
        );

      }
    );

    calculate.addEventListener(
      "click",
      function () {

        const cash =
          EF.parseNumber(
            calculator.querySelector(
              ".ef-cash"
            )
          );

        const investments =
          EF.parseNumber(
            calculator.querySelector(
              ".ef-investments"
            )
          );

        const property =
          EF.parseNumber(
            calculator.querySelector(
              ".ef-property"
            )
          );

        const otherAssets =
          EF.parseNumber(
            calculator.querySelector(
              ".ef-other-assets"
            )
          );

        const mortgageDebt =
          EF.parseNumber(
            calculator.querySelector(
              ".ef-mortgage-debt"
            )
          );

        const loans =
          EF.parseNumber(
            calculator.querySelector(
              ".ef-loans"
            )
          );

        const creditCardDebt =
          EF.parseNumber(
            calculator.querySelector(
              ".ef-credit-card-debt"
            )
          );

        const otherDebts =
          EF.parseNumber(
            calculator.querySelector(
              ".ef-other-debts"
            )
          );

        const values = [

          cash,
          investments,
          property,
          otherAssets,
          mortgageDebt,
          loans,
          creditCardDebt,
          otherDebts

        ];

        const invalid =
          values.some(
            function (value) {

              return (
                !Number.isFinite(value) ||
                value < 0
              );

            }
          );

        if (invalid) {

          EF.showError(
            calculator
          );

          return;

        }

        const result =
          EF.netWorth(
            cash,
            investments,
            property,
            otherAssets,
            mortgageDebt,
            loans,
            creditCardDebt,
            otherDebts
          );

        calculator.querySelector(
          ".ef-net-worth-total"
        ).textContent =
          EF.formatCurrency(
            result.netWorth
          );

        calculator.querySelector(
          ".ef-net-worth-assets"
        ).textContent =
          EF.formatCurrency(
            result.assets
          );

        calculator.querySelector(
          ".ef-net-worth-liabilities"
        ).textContent =
          EF.formatCurrency(
            result.liabilities
          );

        calculator.querySelector(
          ".ef-error"
        ).style.display =
          "none";

        EF.showResults(
          calculator
        );

      }
    );

  };

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      document
        .querySelectorAll(
          ".ef-net-worth-calculator"
        )
        .forEach(
          function (calculator) {

            EF.initNetWorthCalculator(
              calculator
            );

          }
        );

    }
  );

})();
