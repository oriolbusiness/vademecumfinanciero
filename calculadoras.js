(function () {
  "use strict";

  if (window.EF && window.EF.__loaded) return;
  window.EF = window.EF || {};
  EF.__loaded = true;

  const CHART_URL =
    "https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js";

  const PERCENT_CLASSES = [
    "ef-rate",
    "ef-annual-return",
    "ef-withdrawal-rate",
    "ef-real-return"
  ];

  const EURO = {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  };

  const currency = value =>
    Number(value).toLocaleString("es-ES", EURO);

  const isPercent = input =>
    PERCENT_CLASSES.some(className =>
      input.classList.contains(className)
    );

  function parse(input) {
    if (!input) return NaN;

    let value = input.value.trim();

    value = isPercent(input)
      ? value.replace(",", ".")
      : value.replace(/\./g, "");

    return parseFloat(value);
  }

  function formatInput(input) {
    if (isPercent(input)) {
      let value = input.value.replace(/[^\d,]/g, "");

      const parts = value.split(",");

      if (parts.length > 2) {
        value =
          parts[0] +
          "," +
          parts.slice(1).join("");
      }

      if (parts[1] !== undefined) {
        value =
          parts[0] +
          "," +
          parts[1].slice(0, 2);
      }

      input.value = value;
      return;
    }

    const value = input.value.replace(/\D/g, "");

    input.value = value
      ? value.replace(
          /\B(?=(\d{3})+(?!\d))/g,
          "."
        )
      : "";
  }

  function setupInputs(card) {
    card
      .querySelectorAll("input.ef-input")
      .forEach(input => {
        input.addEventListener("input", function () {
          const oldLength = this.value.length;
          const position = this.selectionStart || 0;

          formatInput(this);

          const newPosition = Math.max(
            0,
            position +
              this.value.length -
              oldLength
          );

          this.setSelectionRange(
            newPosition,
            newPosition
          );
        });
      });
  }

  function hide(card) {
    [
      ".ef-results",
      ".ef-chart",
      ".ef-share",
      ".ef-reset"
    ].forEach(selector => {
      const element = card.querySelector(selector);

      if (element) {
        element.style.display = "none";
      }
    });
  }

  function show(card) {
    const results = card.querySelector(".ef-results");
    const chart = card.querySelector(".ef-chart");
    const share = card.querySelector(".ef-share");
    const reset = card.querySelector(".ef-reset");

    if (results) {
      results.style.display = "grid";
    }

    if (chart) {
      chart.style.display = "block";
    }

    if (share) {
      share.style.display = "block";
    }

    if (reset) {
      reset.style.display = "inline-flex";
    }
  }

  function showError(card, message) {
    const error = card.querySelector(".ef-error");

    if (!error) return;

    error.textContent =
      message ||
      "Introduce valores válidos para realizar el cálculo.";

    error.style.display = "block";
  }

  function clearError(card) {
    const error = card.querySelector(".ef-error");

    if (!error) return;

    error.textContent = "";
    error.style.display = "none";
  }

  function setupReset(card) {
    const reset = card.querySelector(".ef-reset");

    if (!reset || reset.dataset.efReady) {
      return;
    }

    reset.dataset.efReady = "1";

    reset.addEventListener("click", () => {
      card
        .querySelectorAll("input")
        .forEach(input => {
          input.value = "";
        });

      card
        .querySelectorAll("select")
        .forEach(select => {
          select.selectedIndex = 0;
        });

      clearError(card);
      hide(card);

      if (card._efChart) {
        card._efChart.destroy();
        card._efChart = null;
      }

      const feedback =
        card.querySelector(".ef-share-feedback");

      if (feedback) {
        feedback.textContent = "";
      }
    });
  }

  function createLine(
    label,
    data,
    borderColor,
    borderWidth
  ) {
    return {
      label,
      data,
      borderColor,
      borderWidth,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHitRadius: 12,
      tension: 0.25,
      fill: false
    };
  }

  function createChart(
    card,
    result,
    datasets
  ) {
    if (!window.Chart) return;

    const canvas =
      card.querySelector(".ef-chart-canvas");

    if (!canvas) return;

    if (card._efChart) {
      card._efChart.destroy();
    }

    card._efChart = new Chart(canvas, {
      type: "line",

      data: {
        labels: result.annualData.map(
          item => item.year
        ),

        datasets
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
                `${context.dataset.label}: ${currency(
                  context.parsed.y
                )}`
            }
          }
        },

        scales: {
          x: {
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

              callback: value =>
                currency(value)
            }
          }
        }
      }
    });
  }

  function setupSharing(card, getText) {
    if (card.dataset.efShareReady) {
      return;
    }

    card.dataset.efShareReady = "1";

    const feedback =
      card.querySelector(".ef-share-feedback");

    const open = url =>
      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

    const bind = (selector, callback) => {
      const element = card.querySelector(selector);

      if (element) {
        element.addEventListener(
          "click",
          callback
        );
      }
    };

    bind(
      ".ef-share-whatsapp",
      () => {
        open(
          "https://wa.me/?text=" +
            encodeURIComponent(getText())
        );
      }
    );

    bind(
      ".ef-share-telegram",
      () => {
        open(
          "https://t.me/share/url?url=" +
            encodeURIComponent(location.href) +
            "&text=" +
            encodeURIComponent(getText())
        );
      }
    );

    bind(
      ".ef-share-facebook",
      () => {
        open(
          "https://www.facebook.com/sharer/sharer.php?u=" +
            encodeURIComponent(location.href)
        );
      }
    );

    bind(
      ".ef-share-x",
      () => {
        open(
          "https://twitter.com/intent/tweet?text=" +
            encodeURIComponent(getText()) +
            "&url=" +
            encodeURIComponent(location.href)
        );
      }
    );

    bind(
      ".ef-share-copy",
      async () => {
        try {
          await navigator.clipboard.writeText(
            getText()
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
      }
    );
  }

  function compound(
    capital,
    monthly,
    rate,
    years,
    frequency
  ) {
    let balance = capital;
    let interest = 0;

    const monthsPerPeriod = 12 / frequency;
    const periodRate =
      rate / 100 / frequency;
    const totalMonths = years * 12;

    const annualData = [
      {
        year: 0,
        invested: capital,
        interest: 0,
        balance: capital
      }
    ];

    for (
      let month = 1;
      month <= totalMonths;
      month++
    ) {
      balance += monthly;

      if (month % monthsPerPeriod === 0) {
        const gain =
          balance * periodRate;

        balance += gain;
        interest += gain;
      }

      if (month % 12 === 0) {
        annualData.push({
          year: month / 12,
          invested:
            capital + monthly * month,
          interest,
          balance
        });
      }
    }

    return {
      invested:
        capital + monthly * totalMonths,
      interest,
      final: balance,
      annualData
    };
  }

  function simple(
    capital,
    rate,
    years
  ) {
    const annualInterest =
      capital * rate / 100;

    const annualData = [];

    for (
      let year = 0;
      year <= years;
      year++
    ) {
      annualData.push({
        year,
        invested: capital,
        interest:
          annualInterest * year,
        balance:
          capital +
          annualInterest * year
      });
    }

    return {
      invested: capital,
      interest:
        annualInterest * years,
      final:
        capital +
        annualInterest * years,
      annualData
    };
  }

  function simpleSavings(
    capital,
    contribution,
    rate,
    years,
    frequency
  ) {
    const periods =
      years * frequency;

    const periodRate =
      rate / 100 / frequency;

    let invested = capital;

    let interest =
      capital *
      rate /
      100 *
      years;

    const annualData = [
      {
        year: 0,
        invested: capital,
        interest: 0,
        balance: capital
      }
    ];

    for (
      let period = 1;
      period <= periods;
      period++
    ) {
      interest +=
        contribution *
        periodRate *
        (periods - period);

      invested += contribution;

      if (period % frequency === 0) {
        annualData.push({
          year: period / frequency,
          invested,
          interest,
          balance:
            invested + interest
        });
      }
    }

    return {
      invested,
      interest,
      final:
        invested + interest,
      annualData
    };
  }

  function mortgage(
    loan,
    rate,
    years
  ) {
    const monthlyRate =
      rate / 100 / 12;

    const months = years * 12;

    const payment =
      monthlyRate === 0
        ? loan / months
        : loan *
          (
            monthlyRate *
            Math.pow(
              1 + monthlyRate,
              months
            )
          ) /
          (
            Math.pow(
              1 + monthlyRate,
              months
            ) - 1
          );

    let balance = loan;
    let interest = 0;

    const annualData = [
      {
        year: 0,
        balance: loan,
        interest: 0
      }
    ];

    for (
      let month = 1;
      month <= months;
      month++
    ) {
      const gain =
        balance * monthlyRate;

      balance -= payment - gain;
      interest += gain;

      if (month % 12 === 0) {
        annualData.push({
          year: month / 12,
          balance:
            Math.max(balance, 0),
          interest
        });
      }
    }

    return {
      monthlyPayment: payment,
      totalInterest: interest,
      totalPaid: loan + interest,
      annualData
    };
  }

  function independence(
    current,
    expenses,
    savings,
    returnRate,
    withdrawal
  ) {
    const target =
      expenses /
      (withdrawal / 100);

    const monthlyReturn =
      Math.pow(
        1 + returnRate / 100,
        1 / 12
      ) - 1;

    let capital = current;
    let months = 0;

    const annualData = [
      {
        year: 0,
        capital,
        target
      }
    ];

    while (
      capital < target &&
      months < 1200
    ) {
      capital =
        capital *
        (1 + monthlyReturn) +
        savings;

      months++;

      if (months % 12 === 0) {
        annualData.push({
          year: months / 12,
          capital,
          target
        });
      }
    }

    if (
      months % 12 !== 0 &&
      capital >= target
    ) {
      annualData.push({
        year: months / 12,
        capital,
        target
      });
    }

    return {
      target,
      years: months / 12,
      annualData,
      reached:
        capital >= target
    };
  }

  function emergency(
    expenses,
    coverage,
    current,
    contribution
  ) {
    const target =
      expenses * coverage;

    const remaining =
      Math.max(
        target - current,
        0
      );

    let capital = current;
    let months = 0;

    const annualData = [
      {
        year: 0,
        capital,
        target
      }
    ];

    while (
      capital < target &&
      contribution > 0 &&
      months < 1200
    ) {
      capital += contribution;
      months++;

      if (months % 12 === 0) {
        annualData.push({
          year: months / 12,
          capital:
            Math.min(
              capital,
              target
            ),
          target
        });
      }
    }

    if (
      months % 12 !== 0 &&
      capital >= target
    ) {
      annualData.push({
        year: months / 12,
        capital: target,
        target
      });
    }

    return {
      target,
      remaining,
      months,
      annualData,
      reached:
        capital >= target
    };
  }

  function retirement(
    age,
    retirementAge,
    savings,
    contribution,
    realReturn,
    income,
    retirementYears
  ) {
    const years =
      retirementAge - age;

    const monthlyRate =
      Math.pow(
        1 + realReturn / 100,
        1 / 12
      ) - 1;

    const months =
      retirementYears * 12;

    const target =
      monthlyRate === 0
        ? income * months
        : income *
          (
            1 -
            Math.pow(
              1 + monthlyRate,
              -months
            )
          ) /
          monthlyRate;

    let projected = savings;

    const annualData = [
      {
        year: 0,
        capital: projected,
        target
      }
    ];

    for (
      let month = 1;
      month <= years * 12;
      month++
    ) {
      projected =
        projected *
        (1 + monthlyRate) +
        contribution;

      if (month % 12 === 0) {
        annualData.push({
          year: month / 12,
          capital: projected,
          target
        });
      }
    }

    return {
      target,
      projected,
      difference:
        projected - target,
      annualData
    };
  }

  function initCard(
    card,
    calculate
  ) {
    if (card.dataset.efReady) {
      return;
    }

    card.dataset.efReady = "1";

    let shareText = "";

    hide(card);
    setupInputs(card);
    setupReset(card);

    setupSharing(
      card,
      () => shareText
    );

    const button =
      card.querySelector(".ef-button");

    if (!button) return;

    button.addEventListener(
      "click",
      () => {
        clearError(card);

        let result;

        try {
          result = calculate(card);
        } catch (error) {
          console.error(
            "Error en calculadora financiera:",
            error
          );

          showError(card);
          return;
        }

        if (!result) {
          showError(card);
          return;
        }

        shareText = result.shareText;

        show(card);

        result.display();

        createChart(
          card,
          result,
          result.datasets
        );
      }
    );
  }

  function setupAll() {

    document
      .querySelectorAll(
        ".ef-interest-calculator"
      )
      .forEach(card => {
        initCard(card, card => {
          const capital = parse(
            card.querySelector(".ef-capital")
          );

          const monthly = parse(
            card.querySelector(".ef-monthly")
          );

          const rate = parse(
            card.querySelector(".ef-rate")
          );

          const years = parse(
            card.querySelector(".ef-years")
          );

          const frequency = parseInt(
            card.querySelector(
              ".ef-frequency"
            ).value,
            10
          );

          if (
            ![
              capital,
              monthly,
              rate,
              years
            ].every(Number.isFinite) ||
            capital < 0 ||
            monthly < 0 ||
            rate < 0 ||
            years <= 0
          ) {
            return null;
          }

          const result = compound(
            capital,
            monthly,
            rate,
            years,
            frequency
          );

          return {
            ...result,

            datasets: [
              createLine(
                "Capital aportado",
                result.annualData.map(
                  item => item.invested
                ),
                "#8AAE6D",
                2
              ),

              createLine(
                "Intereses generados",
                result.annualData.map(
                  item => item.interest
                ),
                "#BC6B4A",
                2
              ),

              createLine(
                "Capital total",
                result.annualData.map(
                  item => item.balance
                ),
                "#3E5A3C",
                3
              )
            ],

            display: () => {
              card.querySelector(
                ".ef-final-balance"
              ).textContent =
                currency(result.final);

              card.querySelector(
                ".ef-total-invested"
              ).textContent =
                currency(result.invested);

              card.querySelector(
                ".ef-total-interest"
              ).textContent =
                currency(result.interest);
            },

            shareText:
              `He calculado que mi capital final sería ${currency(
                result.final
              )} utilizando la calculadora de interés compuesto del Vademécum Financiero.`
          };
        });
      });

    document
      .querySelectorAll(
        ".ef-simple-interest-calculator"
      )
      .forEach(card => {
        initCard(card, card => {
          const capital = parse(
            card.querySelector(".ef-capital")
          );

          const rate = parse(
            card.querySelector(".ef-rate")
          );

          const years = parse(
            card.querySelector(".ef-years")
          );

          if (
            ![
              capital,
              rate,
              years
            ].every(Number.isFinite) ||
            capital < 0 ||
            rate < 0 ||
            years <= 0
          ) {
            return null;
          }

          const result = simple(
            capital,
            rate,
            years
          );

          return {
            ...result,

            datasets: [
              createLine(
                "Capital inicial",
                result.annualData.map(
                  item => item.invested
                ),
                "#8AAE6D",
                2
              ),

              createLine(
                "Intereses generados",
                result.annualData.map(
                  item => item.interest
                ),
                "#BC6B4A",
                2
              ),

              createLine(
                "Capital total",
                result.annualData.map(
                  item => item.balance
                ),
                "#3E5A3C",
                3
              )
            ],

            display: () => {
              card.querySelector(
                ".ef-final-balance"
              ).textContent =
                currency(result.final);

              card.querySelector(
                ".ef-total-invested"
              ).textContent =
                currency(result.invested);

              card.querySelector(
                ".ef-total-interest"
              ).textContent =
                currency(result.interest);
            },

            shareText:
              `He calculado que mi capital final sería ${currency(
                result.final
              )} utilizando la calculadora de interés simple del Vademécum Financiero.`
          };
        });
      });

    document
      .querySelectorAll(
        ".ef-simple-savings-calculator"
      )
      .forEach(card => {
        initCard(card, card => {
          const capital = parse(
            card.querySelector(".ef-capital")
          );

          const contribution = parse(
            card.querySelector(
              ".ef-contribution"
            )
          );

          const rate = parse(
            card.querySelector(".ef-rate")
          );

          const years = parse(
            card.querySelector(".ef-years")
          );

          const frequency = parseInt(
            card.querySelector(
              ".ef-frequency"
            ).value,
            10
          );

          if (
            ![
              capital,
              contribution,
              rate,
              years
            ].every(Number.isFinite) ||
            capital < 0 ||
            contribution < 0 ||
            rate < 0 ||
            years <= 0
          ) {
            return null;
          }

          const result = simpleSavings(
            capital,
            contribution,
            rate,
            years,
            frequency
          );

          return {
            ...result,

            datasets: [
              createLine(
                "Capital aportado",
                result.annualData.map(
                  item => item.invested
                ),
                "#8AAE6D",
                2
              ),

              createLine(
                "Intereses generados",
                result.annualData.map(
                  item => item.interest
                ),
                "#BC6B4A",
                2
              ),

              createLine(
                "Capital total",
                result.annualData.map(
                  item => item.balance
                ),
                "#3E5A3C",
                3
              )
            ],

            display: () => {
              card.querySelector(
                ".ef-final-balance"
              ).textContent =
                currency(result.final);

              card.querySelector(
                ".ef-total-invested"
              ).textContent =
                currency(result.invested);

              card.querySelector(
                ".ef-total-interest"
              ).textContent =
                currency(result.interest);
            },

            shareText:
              `He calculado que mi capital final sería ${currency(
                result.final
              )} utilizando la calculadora de ahorro con interés simple del Vademécum Financiero.`
          };
        });
      });

    document
      .querySelectorAll(
        ".ef-mortgage-calculator"
      )
      .forEach(card => {
        initCard(card, card => {
          const loan = parse(
            card.querySelector(".ef-loan")
          );

          const rate = parse(
            card.querySelector(".ef-rate")
          );

          const years = parse(
            card.querySelector(".ef-years")
          );

          if (
            ![
              loan,
              rate,
              years
            ].every(Number.isFinite) ||
            loan <= 0 ||
            rate < 0 ||
            years <= 0
          ) {
            return null;
          }

          const result = mortgage(
            loan,
            rate,
            years
          );

          return {
            ...result,

            datasets: [
              createLine(
                "Deuda pendiente",
                result.annualData.map(
                  item => item.balance
                ),
                "#3E5A3C",
                3
              ),

              createLine(
                "Intereses acumulados",
                result.annualData.map(
                  item => item.interest
                ),
                "#BC6B4A",
                2
              )
            ],

            display: () => {
              card.querySelector(
                ".ef-monthly-payment"
              ).textContent =
                currency(
                  result.monthlyPayment
                );

              card.querySelector(
                ".ef-total-interest"
              ).textContent =
                currency(
                  result.totalInterest
                );

              card.querySelector(
                ".ef-total-paid"
              ).textContent =
                currency(
                  result.totalPaid
                );
            },

            shareText:
              `He calculado una cuota mensual de ${currency(
                result.monthlyPayment
              )} utilizando la calculadora de hipoteca del Vademécum Financiero.`
          };
        });
      });

    document
      .querySelectorAll(
        ".ef-financial-independence-calculator"
      )
      .forEach(card => {
        initCard(card, card => {
          const current = parse(
            card.querySelector(
              ".ef-current-capital"
            )
          );

          const expenses = parse(
            card.querySelector(
              ".ef-annual-expenses"
            )
          );

          const savings = parse(
            card.querySelector(
              ".ef-monthly-savings"
            )
          );

          const returnRate = parse(
            card.querySelector(
              ".ef-annual-return"
            )
          );

          const withdrawal = parse(
            card.querySelector(
              ".ef-withdrawal-rate"
            )
          );

          if (
            ![
              current,
              expenses,
              savings,
              returnRate,
              withdrawal
            ].every(Number.isFinite) ||
            current < 0 ||
            expenses <= 0 ||
            savings < 0 ||
            returnRate < 0 ||
            withdrawal <= 0 ||
            (
              savings === 0 &&
              current <
                expenses /
                (withdrawal / 100)
            )
          ) {
            return null;
          }

          const result =
            independence(
              current,
              expenses,
              savings,
              returnRate,
              withdrawal
            );

          if (!result.reached) {
            return null;
          }

          return {
            ...result,

            datasets: [
              createLine(
                "Patrimonio acumulado",
                result.annualData.map(
                  item => item.capital
                ),
                "#3E5A3C",
                3
              ),

              createLine(
                "Capital objetivo",
                result.annualData.map(
                  item => item.target
                ),
                "#BC6B4A",
                2
              )
            ],

            display: () => {
              card.querySelector(
                ".ef-fi-target"
              ).textContent =
                currency(result.target);

              card.querySelector(
                ".ef-fi-years"
              ).textContent =
                `${result.years.toLocaleString(
                  "es-ES",
                  {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                  }
                )} años`;

              card.querySelector(
                ".ef-fi-savings"
              ).textContent =
                currency(savings);
            },

            shareText:
              `He calculado que alcanzaría la independencia financiera en aproximadamente ${result.years.toLocaleString(
                "es-ES",
                {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1
                }
              )} años con el Vademécum Financiero.`
          };
        });
      });

    document
      .querySelectorAll(
        ".ef-emergency-fund-calculator"
      )
      .forEach(card => {
        initCard(card, card => {
          const expenses = parse(
            card.querySelector(
              ".ef-monthly-expenses"
            )
          );

          const coverage = parse(
            card.querySelector(
              ".ef-coverage-months"
            )
          );

          const current = parse(
            card.querySelector(
              ".ef-current-savings"
            )
          );

          const contribution = parse(
            card.querySelector(
              ".ef-monthly-contribution"
            )
          );

          if (
            ![
              expenses,
              coverage,
              current,
              contribution
            ].every(Number.isFinite) ||
            expenses <= 0 ||
            coverage <= 0 ||
            current < 0 ||
            contribution < 0
          ) {
            return null;
          }

          const result = emergency(
            expenses,
            coverage,
            current,
            contribution
          );

          return {
            ...result,

            datasets: [
              createLine(
                "Fondo acumulado",
                result.annualData.map(
                  item => item.capital
                ),
                "#3E5A3C",
                3
              ),

              createLine(
                "Fondo recomendado",
                result.annualData.map(
                  item => item.target
                ),
                "#BC6B4A",
                2
              )
            ],

            display: () => {
              card.querySelector(
                ".ef-emergency-target"
              ).textContent =
                currency(result.target);

              card.querySelector(
                ".ef-emergency-remaining"
              ).textContent =
                currency(result.remaining);

              card.querySelector(
                ".ef-emergency-time"
              ).textContent =
                result.remaining === 0
                  ? "Objetivo alcanzado"
                  : result.reached
                    ? `${result.months} meses`
                    : "No se alcanza con la aportación actual";
            },

            shareText:
              `He calculado mi fondo de emergencia recomendado de ${currency(
                result.target
              )} con el Vademécum Financiero.`
          };
        });
      });

    document
      .querySelectorAll(
        ".ef-retirement-calculator"
      )
      .forEach(card => {
        initCard(card, card => {
          const age = parse(
            card.querySelector(
              ".ef-current-age"
            )
          );

          const retirementAge = parse(
            card.querySelector(
              ".ef-retirement-age"
            )
          );

          const savings = parse(
            card.querySelector(
              ".ef-current-savings"
            )
          );

          const contribution = parse(
            card.querySelector(
              ".ef-monthly-contribution"
            )
          );

          const realReturn = parse(
            card.querySelector(
              ".ef-real-return"
            )
          );

          const income = parse(
            card.querySelector(
              ".ef-retirement-income"
            )
          );

          const retirementYears = parse(
            card.querySelector(
              ".ef-retirement-years"
            )
          );

          if (
            ![
              age,
              retirementAge,
              savings,
              contribution,
              realReturn,
              income,
              retirementYears
            ].every(Number.isFinite) ||
            age < 18 ||
            retirementAge <= age ||
            savings < 0 ||
            contribution < 0 ||
            realReturn < 0 ||
            income <= 0 ||
            retirementYears <= 0
          ) {
            return null;
          }

          const result = retirement(
            age,
            retirementAge,
            savings,
            contribution,
            realReturn,
            income,
            retirementYears
          );

          return {
            ...result,

            datasets: [
              createLine(
                "Capital proyectado",
                result.annualData.map(
                  item => item.capital
                ),
                "#3E5A3C",
                3
              ),

              createLine(
                "Capital necesario",
                result.annualData.map(
                  item => item.target
                ),
                "#BC6B4A",
                2
              )
            ],

            display: () => {
              card.querySelector(
                ".ef-retirement-target"
              ).textContent =
                currency(result.target);

              card.querySelector(
                ".ef-retirement-projected"
              ).textContent =
                currency(result.projected);

              card.querySelector(
                ".ef-retirement-difference"
              ).textContent =
                currency(result.difference);
            },

            shareText:
              "He calculado mi planificación para la jubilación con el Vademécum Financiero."
          };
        });
      });
  }

  function loadChart() {
    if (window.Chart) {
      setupAll();
      return;
    }

    const script =
      document.createElement("script");

    script.src = CHART_URL;

    script.onload = setupAll;

    script.onerror = () => {
      console.error(
        "No se pudo cargar Chart.js."
      );
    };

    document.head.appendChild(script);
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      loadChart
    );
  } else {
    loadChart();
  }

})();
