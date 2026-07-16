(function () {

  "use strict";

  window.EF = window.EF || {};

  EF.initNetWorthCalculator = function (calculator) {

    if (!calculator) {

      return;

    }

    if (
      calculator.dataset.efNetWorthInitialized === "true"
    ) {

      return;

    }

    calculator.dataset.efNetWorthInitialized =
      "true";

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

    const totalResult =
      calculator.querySelector(
        ".ef-net-worth-total"
      );

    const assetsResult =
      calculator.querySelector(
        ".ef-net-worth-assets"
      );

    const liabilitiesResult =
      calculator.querySelector(
        ".ef-net-worth-liabilities"
      );

    const shareFeedback =
      calculator.querySelector(
        ".ef-share-feedback"
      );

    if (
      !calculateButton ||
      !resetButton ||
      !totalResult ||
      !assetsResult ||
      !liabilitiesResult
    ) {

      return;

    }

    function formatInput(input) {

      const value =
        input.value
          .replace(/\D/g, "");

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

    function parseInput(input) {

      if (!input) {

        return 0;

      }

      const value =
        input.value
          .replace(/\./g, "")
          .replace(/\s/g, "")
          .trim();

      if (
        value === ""
      ) {

        return 0;

      }

      const number =
        Number(value);

      if (
        !Number.isFinite(number)
      ) {

        return NaN;

      }

      return number;

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

      totalResult.textContent =
        "—";

      assetsResult.textContent =
        "—";

      liabilitiesResult.textContent =
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

            formatInput(
              this
            );

          }
        );

      }
    );

    calculateButton.addEventListener(
      "click",
      function () {

        const cash =
          parseInput(
            calculator.querySelector(
              ".ef-cash"
            )
          );

        const investments =
          parseInput(
            calculator.querySelector(
              ".ef-investments"
            )
          );

        const property =
          parseInput(
            calculator.querySelector(
              ".ef-property"
            )
          );

        const otherAssets =
          parseInput(
            calculator.querySelector(
              ".ef-other-assets"
            )
          );

        const mortgageDebt =
          parseInput(
            calculator.querySelector(
              ".ef-mortgage-debt"
            )
          );

        const loans =
          parseInput(
            calculator.querySelector(
              ".ef-loans"
            )
          );

        const creditCardDebt =
          parseInput(
            calculator.querySelector(
              ".ef-credit-card-debt"
            )
          );

        const otherDebts =
          parseInput(
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

          showError();

          return;

        }

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

        totalResult.textContent =
          formatCurrency(
            netWorth
          );

        assetsResult.textContent =
          formatCurrency(
            totalAssets
          );

        liabilitiesResult.textContent =
          formatCurrency(
            totalLiabilities
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
        "Mi patrimonio neto es de " +
        totalResult.textContent +
        ". Activos: " +
        assetsResult.textContent +
        ". Deudas: " +
        liabilitiesResult.textContent +
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

  };

  function initNetWorthCalculators() {

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

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initNetWorthCalculators
    );

  } else {

    initNetWorthCalculators();

  }

})();
