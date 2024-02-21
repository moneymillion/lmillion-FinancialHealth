document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('financialDataForm');
  form.addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const userData = {};
    formData.forEach((value, key) => {
      userData[key] = !isNaN(parseFloat(value)) ? parseFloat(value) : value;
    });

    // Validate "Types of Investments"
    const investmentsInput = document.getElementById('typesOfInvestments');
    const investmentsValue = investmentsInput.value;
    if (/^\d+$/.test(investmentsValue)) {
      alert('Type of Investments cannot contain only numbers. Retry using this format: TFSA, BOND, DIVIDEND STOCKS, etc...');
      investmentsInput.style.borderColor = 'red';
      return;
    } else {
      investmentsInput.style.borderColor = 'green';
    }

    // Validate numeric inputs
    const inputs = document.querySelectorAll('input[type=number]');
    let isValid = true;
    inputs.forEach(input => {
      const value = parseFloat(input.value);
      if (!isNaN(value) && value >= parseFloat(input.min)) {
        input.style.borderColor = 'green';
      } else {
        input.style.borderColor = 'red';
        isValid = false;
      }
    });

    if (!isValid) {
      alert('Please correct the highlighted fields.');
      return;
    }

    // Proceed if all inputs are valid
    const analysisResults = calculateAnalysisResults(userData);

      // Correctly toggle visibility of the analysis container
      // Now we can safely access the element since the DOM is fully loaded
   const analysisContainer = document.getElementById('financialHealthAnalysisContainer');
   if (analysisContainer) {
     analysisContainer.style.display = 'block'; // Show the container
     displayFinancialHealthAnalysis(analysisResults); // Call your function to display the results
   } else {
     console.error('Element #financialHealthAnalysisContainer not found');
   }
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
          'Debt-to-Income Ratio': calculateDebtIncomeRatioResult(userData),
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
    const basicMonthsToPayOffDebt = userData.totalDebt / userData.monthlyDebtPayment;
    const monthlyLeftover = Math.max(0, userData.monthlyIncome - userData.monthlyExpenses - userData.monthlyDebtPayment);
    const enhancedMonthlyPayment = userData.monthlyDebtPayment + monthlyLeftover;
    const enhancedMonthsToPayOffDebt = userData.totalDebt / enhancedMonthlyPayment;
    const yearsLeft = 75 - userData.age;
    const monthsLeft = yearsLeft * 12;

    const analysis1 = basicMonthsToPayOffDebt;
    const analysis2 = monthlyLeftover > 0 ? enhancedMonthsToPayOffDebt : basicMonthsToPayOffDebt;
    const analysis3 = Math.min(analysis1, monthsLeft);

    // Instead of calculating an average score, directly calculate the average months to pay off debt
    const averageMonthsToPayOffDebt = (analysis1 + analysis2 + analysis3) / 3;

    // Adjust the return object to focus on average months to pay off debt
    return {
        result: `${averageMonthsToPayOffDebt.toFixed(2)} months`,
        score: calculateDebtIncomeRatioScore(averageMonthsToPayOffDebt, monthsLeft) // Ensure this function calculates score appropriately
    };
}

function calculateDebtIncomeRatioScore(averageMonthsToPayOffDebt, monthsLeft) {
    // Adjust the score calculation if necessary to ensure it reflects the desired insights
    let score = 100 * (1 - (averageMonthsToPayOffDebt / monthsLeft));
    score = Math.min(Math.max(score, 0), 100); // Ensure score is between 0 and 100
    return score.toFixed(2); // Format score to 2 decimal places
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
    const analysisTable = document.getElementById('financialHealthTable').getElementsByTagName('tbody')[0];
    analysisTable.innerHTML = ''; // Clear existing rows

    let totalScore = 0;
    let countMetrics = 0;

    Object.keys(results).forEach(metric => {
        let row = analysisTable.insertRow();

        let cellMetric = row.insertCell(0);
        cellMetric.textContent = metric;

        let cellResult = row.insertCell(1);
        cellResult.innerHTML = `<div class="result-circle">${results[metric].result}</div>`;

        let cellScore = row.insertCell(2);
        cellScore.innerHTML = `<div class="score-circle">${results[metric].score}%</div>`;

        totalScore += parseFloat(results[metric].score);
        countMetrics++;
    });

    const averageScore = totalScore / countMetrics;
    document.getElementById('averageScoreText').textContent = `Average Score: ${averageScore.toFixed(2)}%`;
    const averageScoreProgress = document.getElementById('averageScoreProgress');
    averageScoreProgress.style.width = `${averageScore.toFixed(2)}%`;


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
