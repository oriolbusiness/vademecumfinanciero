(function () {

  "use strict";

  function initFinancialIndependenceCalculator(calculator) {

    if (!calculator) {

      return;

    }

    const calculateButton =
      calculator.querySelector(
        ".ef-button"
      );

    const resetButton =
      calculator.querySelector(
        ".ef-reset"
      );

    const inputs =
      calculator.querySelectorAll(
        ".ef-input"
      );

    const error =
      calculator.querySelector(
        ".ef-error"
      );

    const results =
      calculator.querySelector(
        ".ef-results"
      );

    const chart =
      calculator.querySelector(
        ".ef-chart"
      );

    const share =
      calculator.querySelector(
        ".ef-share"
      );

    const targetResult =
      calculator.querySelector(
        ".ef-fi-target"
      );

    const yearsResult =
      calculator.querySelector(
        ".ef-fi-years"
      );

    const savingsResult =
      calculator.querySelector(
        ".ef-fi-savings"
      );

    const shareFeedback =
      calculator.querySelector(
        ".ef-share-feedback"
      );

    if (
      !calculateButton ||
      !resetButton ||
      !targetResult ||
      !yearsResult ||
      !savingsResult
    ) {

      return;

    }

    function formatMoneyInput(input) {

      const value =
        input.value.replace(
          /\D/g,
          ""
        );

      if (
        value === ""
      ) {

        input.value =
          "";

        return;

      }

      input.value =
        value.replace(
          /\B(?=(\d{3})+(?!\d))/g,
          "."
        );

    }

    function parseMoneyInput(input) {

      if (!input) {

        return NaN;

      }

      const value =
        input.value
          .replace(/\./g, "")
          .replace(/\s/g, "")
          .trim();

      if (
        value === ""
      ) {

        return NaN;

      }

      const number =
        Number(value);

      return Number.isFinite(number)
        ? number
        : NaN;

    }

    function parsePercentageInput(input) {

      if (!input) {

        return NaN;

      }

      const value =
        input.value
          .replace(",", ".")
          .trim();

      if (
        value === ""
      ) {

        return NaN;

      }

      const number =
        Number(value);

      return Number.isFinite(number)
        ? number
        : NaN;

    }

    function formatCurrency(value) {

      return Number(value).toLocaleString(
        "es-ES",
        {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }
      );

    }

    function showError() {

      if (!error) {

        return;

      }

      error.textContent =
        "Introduce valores válidos para realizar el cálculo.";

      error.style.display =
        "block";

    }

    function hideError() {

      if (!error) {

        return;

      }

      error.textContent =
        "";

      error.style.display =
        "none";

    }

    function showResults() {

      if (results) {

        results.style.display =
          "grid";

      }

      if (chart) {

        chart.style.display =
          "block";

      }

      if (share) {

        share.style.display =
          "block";

      }

      resetButton.style.display =
        "inline-flex";

    }

    function resetCalculator() {

      inputs.forEach(
        function (input) {

          input.value =
            "";

        }
      );

      targetResult.textContent =
        "—";

      yearsResult.textContent =
        "—";

      savingsResult.textContent =
        "—";

      hideError();

      if (results) {

        results.style.display =
          "none";

      }

      if (chart) {

        chart.style.display =
          "none";

      }

      if (share) {

        share.style.display =
          "none";

      }

      resetButton.style.display =
        "none";

      if (shareFeedback) {

        shareFeedback.textContent =
          "";

      }

    }

    inputs.forEach(
      function (input) {

        input.addEventListener(
          "input",
          function () {

            if (
              this.classList.contains(
                "ef-current-capital"
              ) ||
              this.classList.contains(
                "ef-annual-expenses"
              ) ||
              this.classList.contains(
                "ef-monthly-savings"
              )
            ) {

              formatMoneyInput(
                this
              );

            }

          }
        );

      }
    );

    calculateButton.addEventListener(
      "click",
      function () {

        const currentCapital =
          parseMoneyInput(
            calculator.querySelector(
              ".ef-current-capital"
            )
          );

        const annualExpenses =
          parseMoneyInput(
            calculator.querySelector(
              ".ef-annual-expenses"
            )
          );

        const monthlySavings =
          parseMoneyInput(
            calculator.querySelector(
              ".ef-monthly-savings"
            )
          );

        const annualReturn =
          parsePercentageInput(
            calculator.querySelector(
              ".ef-annual-return"
            )
          );

        const withdrawalRate =
          parsePercentageInput(
            calculator.querySelector(
              ".ef-withdrawal-rate"
            )
          );

        const values = [

          currentCapital,
          annualExpenses,
          monthlySavings,
          annualReturn,
          withdrawalRate

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

        if (
          invalid ||
          withdrawalRate === 0
        ) {

          showError();

          return;

        }

        const targetCapital =
          annualExpenses /
          (
            withdrawalRate /
            100
          );

        const monthlyReturn =
          Math.pow(
            1 +
            annualReturn /
            100,
            1 /
            12
          ) -
          1;

        let capital =
          currentCapital;

        let months =
          0;

        const maxMonths =
          1200;

        while (
          capital < targetCapital &&
          months < maxMonths
        ) {

          capital =
            capital *
            (
              1 +
              monthlyReturn
            ) +
            monthlySavings;

          months++;

        }

        if (
          capital < targetCapital
        ) {

          showError();

          return;

        }

        const years =
          months /
          12;

        targetResult.textContent =
          formatCurrency(
            targetCapital
          );

        yearsResult.textContent =
          years.toLocaleString(
            "es-ES",
            {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1
            }
          );

        savingsResult.textContent =
          formatCurrency(
            monthlySavings
          );

        hideError();

        showResults();

      }
    );

    resetButton.addEventListener(
      "click",
      function () {

        resetCalculator();

      }
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

    function getShareText() {

      return (
        "Mi capital necesario para alcanzar la independencia financiera es de " +
        targetResult.textContent +
        ". Me faltan " +
        yearsResult.textContent +
        " años. Ahorro mensualmente " +
        savingsResult.textContent +
        "."
      );

    }

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

            if (shareFeedback) {

              shareFeedback.textContent =
                "Resultado copiado al portapapeles.";

            }

          } catch (error) {

            if (shareFeedback) {

              shareFeedback.textContent =
                "No se ha podido copiar el resultado.";

            }

          }

        }
      );

    }

  }

  function initFinancialIndependenceCalculators() {

    document
      .querySelectorAll(
        ".ef-financial-independence-calculator"
      )
      .forEach(
        function (calculator) {

          initFinancialIndependenceCalculator(
            calculator
          );

        }
      );

  }

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initFinancialIndependenceCalculators
    );

  } else {

    initFinancialIndependenceCalculators();

  }

})();
