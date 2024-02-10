document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('financialDataForm');
  form.addEventListener('submit', function(event) {
      event.preventDefault();

      const formData = new FormData(form);
      const userData = {};
      formData.forEach((value, key) => {
          userData[key] = !isNaN(parseFloat(value)) ? parseFloat(value) : value;
      });

      // Extracted logic for calculations
      const analysisResults = calculateAnalysisResults(userData);

      // Correctly toggle visibility of the analysis container
      const analysisContainer = document.getElementById('financialHealthAnalysisContainer');
      analysisContainer.style.display = 'block'; // Show the container with the header and results

      displayFinancialHealthAnalysis(analysisResults);
  });
});

  function calculateAnalysisResults(userData) {
      // Calculate emergency fund coverage and score
      const emergencyFundCoverage = calculateEmergencyFundStatusResult(userData.emergencyFundAmount, userData.monthlyExpenses);
      const emergencyFundStatus = {
          result: `${emergencyFundCoverage.toFixed(2)} months`,
          score: calculateEmergencyFundStatusScore(emergencyFundCoverage)
      };

      return {
          'Savings Rate': {
              result: calculateSavingsRateResult(userData),
              score: calculateSavingsRateScore(userData.monthlySavings, userData.monthlyIncome)
          },
          'Debt-to-Income Ratio': {
              result: calculateDebtIncomeRatioResult(userData),
              score: calculateDebtIncomeRatioScore(userData.totalDebt, userData.monthlyIncome)
          },
          'Emergency Fund Status': emergencyFundStatus,
          'Investment Diversity': {
              result: calculateInvestmentDiversityResult(userData),
              score: calculateInvestmentDiversityScore(userData.typesOfInvestments)
          }
      };
  }

// Calculation functions
function calculateSavingsRateResult(userData) {
    return `${(userData.monthlySavings / userData.monthlyIncome * 100).toFixed(2)}%`;
}

function calculateSavingsRateScore(monthlySavings, monthlyIncome) {
    return calculateScore(monthlySavings / monthlyIncome);
}

function calculateDebtIncomeRatioResult(userData) {
    return `${(userData.totalDebt / userData.monthlyIncome * 100).toFixed(2)}%`;
}

function calculateDebtIncomeRatioScore(totalDebt, monthlyIncome) {
    return calculateScore(totalDebt / monthlyIncome);
}

function calculateEmergencyFundStatusResult(emergencyFundAmount, monthlyExpenses) {
    // Calculate how many months the emergency fund can cover
    return emergencyFundAmount / monthlyExpenses;
}

function calculateEmergencyFundStatusScore(emergencyFundCoverage) {
    // Determine score based on months of coverage
    if (emergencyFundCoverage >= 6) {
        return 100; // Excellent
    } else if (emergencyFundCoverage >= 3) {
        return 75; // Good
    } else if (emergencyFundCoverage >= 2) {
        return 50; // Fair
    } else {
        return 25; // Poor
    }
}

function calculateInvestmentDiversityResult(userData) {
    const typesCount = userData.typesOfInvestments.split(',').filter(Boolean).length;
    return `${typesCount} Types`;
}

function calculateInvestmentDiversityScore(typesOfInvestments) {
    const numberOfInvestments = typesOfInvestments.split(',').filter(Boolean).length;
    return calculateScore(numberOfInvestments / 4); // Adjust based on your logic
}

function calculateScore(value) {
    // Adjust this function based on specific score calculations for each metric
    if (value >= 0.95) {
        return 99;
    } else if (value >= 0.76) {
        return 76;
    } else if (value >= 0.56) {
        return 56;
    } else if (value >= 0.26) {
        return 26;
    } else {
        return 11;
    }
}

function displayFinancialHealthAnalysis(results) {
    const analysisSection = document.getElementById('financialHealthAnalysis');
    if (!analysisSection) {
        console.error('Analysis section not found');
        return;
    }
    analysisSection.innerHTML = '';

    let totalScore = 0;
    let countMetrics = 0;

    Object.keys(results).forEach(metric => {
        const metricContainer = document.createElement('div');
        metricContainer.classList.add('metric-container');

        const metricName = document.createElement('div');
        metricName.classList.add('metric-name');
        metricName.textContent = metric;

        const resultCircle = document.createElement('div');
        resultCircle.classList.add('circle-blob');
        // Ensure results are displayed as percentages
        resultCircle.textContent = `Result: ${parseFloat(results[metric].result).toFixed(2)}%`;

        const scoreCircle = document.createElement('div');
        scoreCircle.classList.add('circle-blob');
        scoreCircle.textContent = `Score: ${parseFloat(results[metric].score).toFixed(2)}%`;

        metricContainer.appendChild(metricName);
        metricContainer.appendChild(resultCircle);
        metricContainer.appendChild(scoreCircle);
        analysisSection.appendChild(metricContainer);

        totalScore += parseFloat(results[metric].score);
        countMetrics++;
    });

    const averageScore = totalScore / countMetrics;

    // Append the Financial Health Status heading and progress bar only if they do not already exist
    let financialHealthStatusHeading = analysisSection.querySelector('.financial-health-status-heading');
    if (!financialHealthStatusHeading) {
        financialHealthStatusHeading = document.createElement('h2');
        financialHealthStatusHeading.classList.add('financial-health-status-heading');
        financialHealthStatusHeading.textContent = 'Financial Health Status';
        analysisSection.appendChild(financialHealthStatusHeading);
    }

    let progressBarContainer = analysisSection.querySelector('.progress-bar-container');
    if (!progressBarContainer) {
        progressBarContainer = document.createElement('div');
        progressBarContainer.classList.add('progress-bar-container');
        analysisSection.appendChild(progressBarContainer);
    }

    let progressBar = progressBarContainer.querySelector('.progress-bar');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        progressBarContainer.appendChild(progressBar);
    }

    progressBar.style.width = `${averageScore}%`;

    // Add the percentage text below the progress bar
    let progressBarPercentage = analysisSection.querySelector('.progress-bar-percentage');
    if (!progressBarPercentage) {
        progressBarPercentage = document.createElement('div');
        progressBarPercentage.classList.add('progress-bar-percentage');
        analysisSection.appendChild(progressBarPercentage);
    }

    progressBarPercentage.textContent = `${averageScore.toFixed(2)}%`;

    analysisSection.style.display = 'block';
}
