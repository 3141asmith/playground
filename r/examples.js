window.RSampleCSV='day,temperature,rainfall\nMon,12,2\nTue,14,0\nWed,13,5\nThu,17,0\nFri,16,1\nSat,19,0\nSun,15,3';
window.RScripts=[
 {id:'vectors',title:'Vectors & calculations',group:'R basics',description:'Create a vector, calculate a mean and work on every value at once. R uses one-based indexing and vectorised operations.',challenge:'Change one mark and predict the new mean. Compare marks[1] with marks[2], then replace marks + 5 with marks * 2.',code:`# c() combines values into a vector.
marks <- c(54, 68, 72, 81, 65)
marks

cat("Number of marks:", length(marks), "\\n")
cat("Mean:", mean(marks), "\\n")
cat("Median:", median(marks), "\\n")
cat("Range:", range(marks), "\\n")

# Work on every value, rather than writing a loop.
improved <- marks + 5
improved

# R starts indexing at 1.
cat("First mark:", marks[1], "\\n")
cat("At least 70:", marks[marks >= 70], "\\n")
`},
 {id:'functions',title:'Functions & loops',group:'R basics',description:'Write a reusable function and call it from a loop. Compare the loop with vectorised use of the same calculation.',challenge:'Add a Fahrenheit-to-Celsius function and check that it reverses the conversion. Why does the first function also work when its argument is a vector?',code:`celsius_to_fahrenheit <- function(celsius) {
  celsius * 9 / 5 + 32
}

temperatures <- c(0, 10, 20, 30)

for (value in temperatures) {
  cat(value, "C =", celsius_to_fahrenheit(value), "F\\n")
}

# Vectorised calculation gives the same converted values.
celsius_to_fahrenheit(temperatures)
`},
 {id:'input',title:'Read input',group:'R basics',description:'Supply answers before running and use readline() to consume them in order. The workspace provides this buffered input function for browser R.',challenge:'Open Data & input below the editor. Put a name on the first answer line and an integer on the second. Try omitting an answer and explain the resulting error.',stdin:'Ada\n3',code:`name <- readline("Your name: ")
count <- as.integer(readline("How many greetings? "))

if (is.na(count) || count < 1 || count > 100) {
  stop("Choose a whole-number count from 1 to 100.")
}

for (i in seq_len(count)) {
  cat(i, ". Hello, ", name, "!\\n", sep = "")
}
`},
 {id:'data-frames',title:'Data frames & filtering',group:'Data & statistics',description:'Build a small table, select rows and add a calculated column. Each column holds a variable and each row represents an observation.',challenge:'Change the pass threshold and predict which rows remain. Add another pupil, then sort by the new percentage column.',code:`results <- data.frame(
  name = c("Ada", "Ben", "Chloe", "Dylan", "Eva"),
  score = c(18, 12, 16, 9, 20),
  maximum = 20
)

results$percentage <- 100 * results$score / results$maximum
results

cat("\\nScores of at least 75%:\\n")
subset(results, percentage >= 75)

cat("\\nHighest percentage first:\\n")
results[order(-results$percentage), ]
`},
 {id:'summary',title:'Summaries & missing values',group:'Data & statistics',description:'Compare measures of centre and spread, and see how missing values affect calculations. na.rm removes missing observations for that operation.',challenge:'Replace 100 with 16 and compare mean, median and standard deviation. Explain why dropping missing values is an analytical choice rather than proof the remaining data is representative.',code:`values <- c(10, 12, 13, 14, 15, 100, NA)

summary(values)
cat("Missing values:", sum(is.na(values)), "\\n")
cat("Mean without removing NA:", mean(values), "\\n")
cat("Mean:", mean(values, na.rm = TRUE), "\\n")
cat("Median:", median(values, na.rm = TRUE), "\\n")
cat("Sample SD:", sd(values, na.rm = TRUE), "\\n")
quantile(values, probs = c(0.25, 0.5, 0.75), na.rm = TRUE)
`},
 {id:'csv',title:'Explore CSV data',group:'Data & statistics',description:'Read the CSV text below the editor into a table, summarise it and draw a line plot. You can paste data or upload a CSV without sending it to an execution server.',challenge:'Open Data & input and change a temperature. Run again to see both the summary and plot update. For your own CSV, adapt the column names and types in the script.',code:`# csv_text comes from the Data & input panel.
weather <- read.csv(text = csv_text)
weather
summary(weather)

cat("Mean temperature:", mean(weather$temperature), "\\n")
cat("Total rainfall:", sum(weather$rainfall), "\\n")

plot(seq_len(nrow(weather)), weather$temperature,
     type = "o", pch = 19, col = "#32647a",
     xaxt = "n", xlab = "Day", ylab = "Temperature (C)",
     main = "A week of temperatures")
axis(1, at = seq_len(nrow(weather)), labels = weather$day)
grid()
`},
 {id:'histogram',title:'Histogram & distribution',group:'Plots & models',description:'Generate a reproducible sample and explore its distribution with a histogram. Changing the number of breaks changes how the same observations are grouped.',challenge:'Change the sample size or breaks. Then replace rnorm() with runif() and compare the shape. A seed makes the random sequence reproducible; it does not make a sample representative.',code:`set.seed(42)
heights <- rnorm(200, mean = 170, sd = 9)

cat("Sample mean:", round(mean(heights), 2), "\\n")
cat("Sample SD:", round(sd(heights), 2), "\\n")

hist(heights, breaks = 15, col = "#c7d9de", border = "white",
     main = "A simulated sample", xlab = "Height (cm)")
abline(v = mean(heights), col = "#b64223", lwd = 2)
legend("topright", legend = "Sample mean", col = "#b64223",
       lwd = 2, bty = "n")
`},
 {id:'regression',title:'Scatter plot & regression',group:'Plots & models',description:'Fit a straight-line model to a small dataset and compare observations with the fitted line. The model describes association; the plot alone cannot establish causation.',challenge:'Move one observation and compare the coefficients and residuals. What assumptions would you need before using the fitted line to make a meaningful prediction?',code:`hours <- c(1, 2, 3, 4, 5, 6, 7, 8)
score <- c(42, 48, 51, 60, 63, 72, 74, 83)
model <- lm(score ~ hours)

cat("Intercept and slope:\\n")
coef(model)
summary(model)

plot(hours, score, pch = 19, col = "#32647a",
     xlab = "Practice hours", ylab = "Score",
     main = "Observations and a fitted line")
abline(model, col = "#b64223", lwd = 2)
grid()

cat("Predicted score at 4 hours:\\n")
predict(model, newdata = data.frame(hours = 4))
`},
 {id:'boxplots',title:'Compare groups',group:'Plots & models',description:'Summarise three groups and compare them with boxplots. The boxes show quartiles and the median; points beyond the whiskers follow R’s boxplot rule.',challenge:'Add an extreme value to one group. Compare how its mean, median and boxplot change. Do not assume a point beyond a whisker is a data-entry error.',code:`group <- rep(c("A", "B", "C"), each = 6)
score <- c(12, 15, 14, 17, 13, 16,
           18, 20, 19, 23, 17, 21,
           14, 16, 18, 15, 22, 17)
results <- data.frame(group, score)

aggregate(score ~ group, data = results, FUN = mean)
aggregate(score ~ group, data = results, FUN = median)

boxplot(score ~ group, data = results,
        col = c("#c7d9de", "#d8dfbf", "#e8c9b4"),
        xlab = "Group", ylab = "Score", main = "Compare three groups")
stripchart(score ~ group, data = results, method = "stack",
           vertical = TRUE, add = TRUE, pch = 19, col = "#32647a")
`},
 {id:'probability',title:'Binomial probability',group:'Data & statistics',description:'Calculate exact probabilities for a fixed number of independent trials, then plot the distribution. Compare a single outcome with a cumulative probability.',challenge:'Change trials and probability. Which outcomes become more likely? The binomial model assumes independent trials with the same success probability.',code:`trials <- 10
probability <- 0.5
successes <- 0:trials
probabilities <- dbinom(successes, size = trials, prob = probability)

cat("P(exactly 5):", dbinom(5, trials, probability), "\\n")
cat("P(at most 3):", pbinom(3, trials, probability), "\\n")
cat("Total probability:", sum(probabilities), "\\n")

barplot(probabilities, names.arg = successes, col = "#90b3bd",
        xlab = "Number of successes", ylab = "Probability",
        main = "Binomial distribution")
`},
 {id:'bootstrap',title:'Bootstrap a mean',group:'Data & statistics',description:'Resample observed values with replacement to explore uncertainty in a sample mean. This illustrates a percentile bootstrap interval, not a guarantee about every population.',challenge:'Change the sample or number of repeats. Explain why this procedure cannot fix a biased or unrepresentative original sample.',code:`set.seed(42)
sample_values <- c(12, 15, 13, 17, 14, 16, 19, 11, 18, 15)
repeats <- 1000

boot_means <- replicate(repeats,
  mean(sample(sample_values, length(sample_values), replace = TRUE)))

cat("Observed mean:", mean(sample_values), "\\n")
cat("Percentile bootstrap interval:\\n")
quantile(boot_means, c(0.025, 0.975))

hist(boot_means, breaks = 20, col = "#c7d9de", border = "white",
     xlab = "Resampled mean", main = "Bootstrap means")
abline(v = mean(sample_values), col = "#b64223", lwd = 2)
`},
 {id:'multiple-plots',title:'Several plots in one run',group:'Plots & models',description:'Create separate plot pages and a panelled figure. Each captured page appears in the gallery and can be downloaded as a PNG.',challenge:'Change the sine wave’s frequency. Compare drawing two separate plots with using par(mfrow) to arrange panels on a single page.',code:`x <- seq(0, 2 * pi, length.out = 200)

plot(x, sin(x), type = "l", lwd = 2, col = "#32647a",
     xlab = "x", ylab = "sin(x)", main = "Sine wave")

plot(x, cos(x), type = "l", lwd = 2, col = "#b64223",
     xlab = "x", ylab = "cos(x)", main = "Cosine wave")

par(mfrow = c(1, 2))
plot(x, sin(x), type = "l", main = "Sine", col = "#32647a")
plot(x, cos(x), type = "l", main = "Cosine", col = "#b64223")
par(mfrow = c(1, 1))
cat("Two separate pages and one two-panel page.\\n")
`}
];
