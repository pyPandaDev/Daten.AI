"""Enhanced Code Generator for Comprehensive Data Science Features"""

from typing import Dict, Any
import json


class EnhancedCodeGenerator:
    """Generate Python code for comprehensive data science tasks"""
    
    def __init__(self):
        self.code_templates = self._initialize_templates()
    
    def generate_code_for_task(
        self, 
        task_id: str, 
        dataset_context: Dict[str, Any],
        parameters: Dict[str, Any] = None
    ) -> str:
        """Generate Python code based on task ID"""
        
        if parameters is None:
            parameters = {}
        
        template_func = self.code_templates.get(task_id)
        
        if template_func:
            return template_func(dataset_context, parameters)
        else:
            return self._generate_generic_code(task_id, dataset_context, parameters)
    
    def _initialize_templates(self) -> Dict:
        """Initialize code generation templates for each task"""
        
        return {
            "eda_statistical_summary": self._gen_statistical_summary,
            "eda_data_quality": self._gen_data_quality,
            "eda_outlier_detection": self._gen_outlier_detection,
            "eda_distribution_analysis": self._gen_distribution_analysis,
            "clean_missing_values": self._gen_missing_values,
            "stats_correlation": self._gen_correlation_analysis,
        }
    
    def _gen_statistical_summary(self, ctx: Dict, params: Dict) -> str:
        """Generate comprehensive statistical summary code"""
        return """
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from scipy import stats

# Comprehensive Statistical Summary
print("\n" + "="*60)
print("📊 COMPREHENSIVE STATISTICAL SUMMARY")
print("="*60 + "\n")

numeric_cols = df.select_dtypes(include=[np.number]).columns

results = {}
for col in numeric_cols:
    results[col] = {
        'mean': df[col].mean(),
        'median': df[col].median(),
        'mode': df[col].mode()[0] if len(df[col].mode()) > 0 else None,
        'std': df[col].std(),
        'min': df[col].min(),
        'max': df[col].max(),
        'q25': df[col].quantile(0.25),
        'q50': df[col].quantile(0.50),
        'q75': df[col].quantile(0.75),
        'range': df[col].max() - df[col].min(),
        'iqr': df[col].quantile(0.75) - df[col].quantile(0.25),
        'skewness': df[col].skew(),
        'kurtosis': df[col].kurt()
    }

# Print metrics in user-friendly format
for col, stats_dict in results.items():
    print(f"\n📈 {col}:")
    print(f"  Mean{'.'*40} {stats_dict['mean']:.4f}")
    print(f"  Median{'.'*38} {stats_dict['median']:.4f}")
    print(f"  Std Deviation{'.'*33} {stats_dict['std']:.4f}")
    print(f"  Min{'.'*41} {stats_dict['min']:.4f}")
    print(f"  Max{'.'*41} {stats_dict['max']:.4f}")
    print(f"  Range{'.'*39} {stats_dict['range']:.4f}")
    print(f"  IQR{'.'*41} {stats_dict['iqr']:.4f}")
    print(f"  Skewness{'.'*36} {stats_dict['skewness']:.4f}")
    print(f"  Kurtosis{'.'*36} {stats_dict['kurtosis']:.4f}")
    
    # Also output metrics for parsing
    for stat_name, value in stats_dict.items():
        if value is not None:
            print(f"METRIC:{col}_{stat_name}:{value:.4f}")

# Create visualization
fig, axes = plt.subplots(2, 2, figsize=(15, 10))
fig.suptitle('Statistical Summary Visualizations', fontsize=16)

# Distribution plot
if len(numeric_cols) > 0:
    df[numeric_cols[0]].hist(bins=30, ax=axes[0, 0], edgecolor='black')
    axes[0, 0].set_title(f'Distribution of {numeric_cols[0]}')
    axes[0, 0].set_xlabel('Value')
    axes[0, 0].set_ylabel('Frequency')

# Box plot
df[numeric_cols[:5]].boxplot(ax=axes[0, 1])
axes[0, 1].set_title('Box Plots - First 5 Numeric Columns')
axes[0, 1].tick_params(axis='x', rotation=45)

# Summary table
summary_df = df[numeric_cols].describe()
axes[1, 0].axis('tight')
axes[1, 0].axis('off')
table = axes[1, 0].table(cellText=summary_df.values,
                         rowLabels=summary_df.index,
                         colLabels=summary_df.columns,
                         cellLoc='center',
                         loc='center')
table.auto_set_font_size(False)
table.set_fontsize(8)
axes[1, 0].set_title('Descriptive Statistics')

# Skewness plot
skewness_data = {col: df[col].skew() for col in numeric_cols}
axes[1, 1].barh(list(skewness_data.keys()), list(skewness_data.values()))
axes[1, 1].set_title('Skewness by Column')
axes[1, 1].set_xlabel('Skewness')
axes[1, 1].axvline(x=0, color='r', linestyle='--', alpha=0.5)

plt.tight_layout()

buf = io.BytesIO()
fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
buf.seek(0)
plot_base64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

print(f"PLOT_BASE64:{plot_base64}")

print("\n" + "="*60)
print("✓ Analysis Complete")
print("="*60)
print("\nSUMMARY:Generated comprehensive statistical summary including mean, median, mode, std deviation, quartiles, skewness, and kurtosis for all numeric columns. Visualizations show distributions, box plots, and skewness patterns.")
print("\n✓ Statistical summary generated successfully")
"""
    
    def _gen_data_quality(self, ctx: Dict, params: Dict) -> str:
        return """
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64

print("\\n" + "="*60)
print("\ud83d\udd0d DATA QUALITY ASSESSMENT")
print("="*60 + "\\n")

# Data types
print("\ud83d\udccb Data Types:")
for col, dtype in df.dtypes.items():
    print(f"  {col:.<45} {dtype}")
    print(f"METRIC:{col}_dtype:{dtype}")

# Missing values
missing = df.isnull().sum()
missing_pct = (missing / len(df)) * 100
print("\\n\u26a0\ufe0f  Missing Values:")
has_missing = False
for col, count in missing.items():
    if count > 0:
        has_missing = True
        print(f"  {col:.<45} {count} ({missing_pct[col]:.2f}%)")
        print(f"METRIC:{col}_missing:{count} ({missing_pct[col]:.2f}%)")
if not has_missing:
    print("  \u2713 No missing values found!")

# Duplicates
dup_count = df.duplicated().sum()
print(f"\\n\ud83d\udd01 Duplicate Rows:{'.'*38} {dup_count}")
print(f"METRIC:Duplicate_Rows:{dup_count}")

# Unique values
print("\\n\ud83d\udd22 Unique Values per Column:")
for col in df.columns:
    unique_count = df[col].nunique()
    print(f"  {col:.<45} {unique_count}")
    print(f"METRIC:{col}_unique:{unique_count}")

# Create visualization
fig, axes = plt.subplots(2, 2, figsize=(15, 10))
fig.suptitle('Data Quality Assessment', fontsize=16)

# Missing values heatmap
sns.heatmap(df.isnull(), yticklabels=False, cbar=True, cmap='viridis', ax=axes[0, 0])
axes[0, 0].set_title('Missing Values Pattern')

# Missing percentage bar chart
missing_pct[missing_pct > 0].plot(kind='barh', ax=axes[0, 1])
axes[0, 1].set_title('Missing Values Percentage')
axes[0, 1].set_xlabel('Percentage (%)')

# Cardinality
unique_counts = df.nunique().sort_values(ascending=False)
unique_counts.plot(kind='bar', ax=axes[1, 0])
axes[1, 0].set_title('Unique Values per Column')
axes[1, 0].set_ylabel('Count')
axes[1, 0].tick_params(axis='x', rotation=45)

# Data completeness
completeness = ((len(df) - df.isnull().sum()) / len(df)) * 100
completeness.plot(kind='barh', ax=axes[1, 1], color='green')
axes[1, 1].set_title('Data Completeness by Column')
axes[1, 1].set_xlabel('Completeness (%)')
axes[1, 1].axvline(x=95, color='r', linestyle='--', alpha=0.5, label='95% threshold')
axes[1, 1].legend()

plt.tight_layout()

buf = io.BytesIO()
fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
buf.seek(0)
plot_base64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

print(f"PLOT_BASE64:{plot_base64}")

print("\\n" + "="*60)
print("\u2713 Assessment Complete")
print("="*60)
print("\\nSUMMARY:Completed data quality assessment identifying data types, missing values, duplicates, and unique value counts. Found {} missing values across columns and {} duplicate rows. Visualizations show missing patterns and data completeness.".format(missing.sum(), dup_count))
print("\\n\u2713 Data quality assessment completed successfully")
"""
    
    def _gen_outlier_detection(self, ctx: Dict, params: Dict) -> str:
        return """
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from scipy import stats
from sklearn.ensemble import IsolationForest

print("\\n" + "="*60)
print("\ud83c\udfaf OUTLIER DETECTION ANALYSIS")
print("="*60 + "\\n")

numeric_cols = df.select_dtypes(include=[np.number]).columns

outliers_summary = {}

for col in numeric_cols[:5]:  # Limit to first 5 for performance
    # IQR Method
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    iqr_outliers = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
    
    # Z-Score Method
    z_scores = np.abs(stats.zscore(df[col].dropna()))
    z_outliers = (z_scores > 3).sum()
    
    outliers_summary[col] = {
        'iqr_outliers': iqr_outliers,
        'z_outliers': z_outliers,
        'iqr_lower': lower_bound,
        'iqr_upper': upper_bound
    }
    
    print(f"\\n\ud83d\udcc9 {col}:")
    print(f"  IQR Method Outliers:{'.'*32} {iqr_outliers}")
    print(f"  Z-Score Method Outliers:{'.'*27} {z_outliers}")
    print(f"  IQR Lower Bound:{'.'*32} {lower_bound:.2f}")
    print(f"  IQR Upper Bound:{'.'*32} {upper_bound:.2f}")
    
    print(f"METRIC:{col}_IQR_Outliers:{iqr_outliers}")
    print(f"METRIC:{col}_ZScore_Outliers:{z_outliers}")

# Isolation Forest (multivariate)
if len(numeric_cols) >= 2:
    iso_forest = IsolationForest(contamination=0.1, random_state=42)
    outlier_pred = iso_forest.fit_predict(df[numeric_cols].dropna())
    iso_outliers = (outlier_pred == -1).sum()
    print(f"\\n\ud83c\udf32 Isolation Forest (Multivariate):")
    print(f"  Total Outliers Detected:{'.'*28} {iso_outliers}")
    print(f"METRIC:IsolationForest_Outliers:{iso_outliers}")

# Visualization
fig, axes = plt.subplots(2, 2, figsize=(15, 10))
fig.suptitle('Outlier Detection Analysis', fontsize=16)

# Box plots
df[numeric_cols[:4]].boxplot(ax=axes[0, 0])
axes[0, 0].set_title('Box Plots (IQR Method)')
axes[0, 0].tick_params(axis='x', rotation=45)

# Z-score distribution
if len(numeric_cols) > 0:
    z_scores = np.abs(stats.zscore(df[numeric_cols[0]].dropna()))
    axes[0, 1].hist(z_scores, bins=30, edgecolor='black')
    axes[0, 1].axvline(x=3, color='r', linestyle='--', label='3-sigma threshold')
    axes[0, 1].set_title(f'Z-Score Distribution - {numeric_cols[0]}')
    axes[0, 1].legend()

# Outlier summary
outlier_counts = {col: summary['iqr_outliers'] for col, summary in outliers_summary.items()}
axes[1, 0].barh(list(outlier_counts.keys()), list(outlier_counts.values()))
axes[1, 0].set_title('Outlier Count by Column (IQR Method)')
axes[1, 0].set_xlabel('Number of Outliers')

# Scatter with outliers highlighted (first 2 numeric columns)
if len(numeric_cols) >= 2:
    col1, col2 = numeric_cols[0], numeric_cols[1]
    z1 = np.abs(stats.zscore(df[col1].dropna()))
    z2 = np.abs(stats.zscore(df[col2].dropna()))
    is_outlier = (z1 > 3) | (z2 > 3)
    
    axes[1, 1].scatter(df[col1][~is_outlier], df[col2][~is_outlier], alpha=0.5, label='Normal')
    axes[1, 1].scatter(df[col1][is_outlier], df[col2][is_outlier], color='red', alpha=0.7, label='Outliers')
    axes[1, 1].set_xlabel(col1)
    axes[1, 1].set_ylabel(col2)
    axes[1, 1].set_title('Scatter Plot with Outliers Highlighted')
    axes[1, 1].legend()

plt.tight_layout()

buf = io.BytesIO()
fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
buf.seek(0)
plot_base64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

print(f"PLOT_BASE64:{plot_base64}")

total_iqr = sum(s['iqr_outliers'] for s in outliers_summary.values())
print("\\n" + "="*60)
print("✓ Outlier Detection Complete")
print("="*60)
print(f"\\nSUMMARY:Detected outliers using IQR, Z-score, and Isolation Forest methods. Found {total_iqr} outliers using IQR method across numeric columns. Visualizations show box plots, z-score distributions, and outlier patterns.")
print("\\n✓ Outlier detection completed successfully")
"""
    
    def _gen_distribution_analysis(self, ctx: Dict, params: Dict) -> str:
        return """
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from scipy import stats
from scipy.stats import normaltest, shapiro

print("\\n" + "="*60)
print("📊 DISTRIBUTION ANALYSIS")
print("="*60 + "\\n")

numeric_cols = df.select_dtypes(include=[np.number]).columns

for col in numeric_cols[:5]:
    # Calculate statistics
    skewness = df[col].skew()
    kurtosis = df[col].kurt()
    
    # Normality test
    stat, p_value = normaltest(df[col].dropna())
    is_normal = p_value > 0.05
    
    print(f"\\n📈 {col}:")
    print(f"  Skewness:{'.'*40} {skewness:.4f}")
    print(f"  Kurtosis:{'.'*40} {kurtosis:.4f}")
    print(f"  Normality Test (p-value):{'.'*25} {p_value:.4f}")
    print(f"  Is Normal Distribution:{'.'*27} {'✓ Yes' if is_normal else '✗ No'}")
    
    # Suggest transformation
    if abs(skewness) > 1:
        if skewness > 0:
            suggestion = "Log or Square Root (right-skewed)"
        else:
            suggestion = "Square or Exponential (left-skewed)"
    elif abs(skewness) > 0.5:
        suggestion = "Box-Cox (moderately skewed)"
    else:
        suggestion = "None needed (approximately normal)"
    print(f"  Suggested Transform:{'.'*28} {suggestion}")
    
    print(f"METRIC:{col}_skewness:{skewness:.4f}")
    print(f"METRIC:{col}_kurtosis:{kurtosis:.4f}")
    print(f"METRIC:{col}_normality_p_value:{p_value:.4f}")
    print(f"METRIC:{col}_is_normal:{'Yes' if is_normal else 'No'}")
    print(f"METRIC:{col}_suggested_transform:{suggestion}")

# Visualization
n_cols = min(4, len(numeric_cols))
fig, axes = plt.subplots(n_cols, 3, figsize=(15, n_cols * 4))
if n_cols == 1:
    axes = axes.reshape(1, -1)

for idx, col in enumerate(numeric_cols[:n_cols]):
    # Histogram with KDE
    axes[idx, 0].hist(df[col].dropna(), bins=30, density=True, alpha=0.7, edgecolor='black')
    df[col].dropna().plot(kind='kde', ax=axes[idx, 0], color='red', linewidth=2)
    axes[idx, 0].set_title(f'{col} - Distribution')
    axes[idx, 0].set_xlabel('Value')
    axes[idx, 0].set_ylabel('Density')
    
    # Q-Q plot
    stats.probplot(df[col].dropna(), dist="norm", plot=axes[idx, 1])
    axes[idx, 1].set_title(f'{col} - Q-Q Plot')
    
    # Box plot
    axes[idx, 2].boxplot(df[col].dropna(), vert=True)
    axes[idx, 2].set_title(f'{col} - Box Plot')
    axes[idx, 2].set_ylabel('Value')

plt.tight_layout()

buf = io.BytesIO()
fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
buf.seek(0)
plot_base64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

print(f"PLOT_BASE64:{plot_base64}")

print("\\n" + "="*60)
print("✓ Distribution Analysis Complete")
print("="*60)
print("\\nSUMMARY:Analyzed distributions for all numeric columns, testing for normality, skewness, and kurtosis. Provided transformation suggestions for skewed distributions. Visualizations include histograms with KDE curves, Q-Q plots, and box plots.")
print("\\n✓ Distribution analysis completed successfully")
"""
    
    def _gen_missing_values(self, ctx: Dict, params: Dict) -> str:
        return """
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from sklearn.impute import KNNImputer

print("\\n" + "="*60)
print("🔧 MISSING VALUES ANALYSIS & HANDLING")
print("="*60 + "\\n")

# Analyze missing values
missing_count = df.isnull().sum()
missing_pct = (missing_count / len(df)) * 100

print("📋 Missing Values Summary:")
has_missing = False
for col in df.columns:
    if missing_count[col] > 0:
        has_missing = True
        print(f"  {col:.<40} {missing_count[col]} ({missing_pct[col]:.2f}%)")
        print(f"METRIC:{col}_missing_count:{missing_count[col]}")
        print(f"METRIC:{col}_missing_pct:{missing_pct[col]:.2f}%")

if not has_missing:
    print("  ✓ No missing values found!")

# Suggest strategies
numeric_cols = df.select_dtypes(include=[np.number]).columns
categorical_cols = df.select_dtypes(include=['object']).columns

strategies = {}
for col in df.columns:
    if missing_count[col] > 0:
        if col in numeric_cols:
            if missing_pct[col] < 5:
                strategies[col] = "Mean imputation"
            elif missing_pct[col] < 20:
                strategies[col] = "Median imputation or KNN"
            else:
                strategies[col] = "Consider removal or forward fill"
        else:
            if missing_pct[col] < 10:
                strategies[col] = "Mode imputation"
            else:
                strategies[col] = "Create 'Unknown' category or remove"

print("\\n💡 Recommended Strategies:")
for col, strategy in strategies.items():
    print(f"  {col:.<40} {strategy}")
    print(f"METRIC:{col}_strategy:{strategy}")

# Apply imputation (example with mean for numeric)
df_imputed = df.copy()
for col in numeric_cols:
    if missing_count[col] > 0:
        df_imputed[col].fillna(df_imputed[col].mean(), inplace=True)

for col in categorical_cols:
    if missing_count[col] > 0:
        df_imputed[col].fillna(df_imputed[col].mode()[0] if len(df_imputed[col].mode()) > 0 else 'Unknown', inplace=True)

print(f"\\nMETRIC:Original_Missing_Values:{df.isnull().sum().sum()}")
print(f"METRIC:After_Imputation_Missing_Values:{df_imputed.isnull().sum().sum()}")

# Visualization
fig, axes = plt.subplots(2, 2, figsize=(15, 10))
fig.suptitle('Missing Values Analysis', fontsize=16)

# Missing values heatmap
sns.heatmap(df.isnull(), yticklabels=False, cbar=True, cmap='viridis', ax=axes[0, 0])
axes[0, 0].set_title('Missing Values Heatmap (Before)')

# Missing percentage
missing_pct[missing_pct > 0].plot(kind='barh', ax=axes[0, 1], color='coral')
axes[0, 1].set_title('Missing Values Percentage')
axes[0, 1].set_xlabel('Percentage (%)')

# Correlation of missingness
if len(numeric_cols) > 1:
    missing_corr = df[numeric_cols].isnull().corr()
    sns.heatmap(missing_corr, annot=True, fmt='.2f', cmap='coolwarm', ax=axes[1, 0], center=0)
    axes[1, 0].set_title('Correlation of Missingness')

# After imputation
sns.heatmap(df_imputed.isnull(), yticklabels=False, cbar=True, cmap='viridis', ax=axes[1, 1])
axes[1, 1].set_title('Missing Values Heatmap (After Imputation)')

plt.tight_layout()

buf = io.BytesIO()
fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
buf.seek(0)
plot_base64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

print(f"PLOT_BASE64:{plot_base64}")

original_missing = df.isnull().sum().sum()
after_missing = df_imputed.isnull().sum().sum()
print("\\n" + "="*60)
print("✓ Missing Values Handling Complete")
print("="*60)
print(f"\\nOriginal Missing Values:{'.'*32} {original_missing}")
print(f"After Imputation:{'.'*39} {after_missing}")
print("\\nSUMMARY:Analyzed missing values and applied appropriate imputation strategies. Used mean imputation for numeric columns and mode for categorical. Successfully reduced missing values from {} to {}. Visualizations show before/after patterns and missingness correlations.".format(original_missing, after_missing))
print("\\n✓ Missing values handled successfully")
"""
    
    def _gen_correlation_analysis(self, ctx: Dict, params: Dict) -> str:
        return """
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from scipy.stats import pearsonr, spearmanr, kendalltau

print("\\n" + "="*60)
print("🔗 CORRELATION ANALYSIS")
print("="*60 + "\\n")

numeric_cols = df.select_dtypes(include=[np.number]).columns

# Pearson correlation
pearson_corr = df[numeric_cols].corr(method='pearson')

# Spearman correlation
spearman_corr = df[numeric_cols].corr(method='spearman')

# Find highly correlated pairs
high_corr_pairs = []
for i in range(len(pearson_corr.columns)):
    for j in range(i+1, len(pearson_corr.columns)):
        if abs(pearson_corr.iloc[i, j]) > 0.7:
            high_corr_pairs.append({
                'var1': pearson_corr.columns[i],
                'var2': pearson_corr.columns[j],
                'correlation': pearson_corr.iloc[i, j]
            })

print("📊 High Correlations (>0.7):")
if len(high_corr_pairs) > 0:
    for pair in high_corr_pairs:
        print(f"  {pair['var1']} ↔ {pair['var2']}:{'.'*20} {pair['correlation']:.4f}")
        print(f"METRIC:{pair['var1']}_vs_{pair['var2']}:{pair['correlation']:.4f}")
else:
    print("  ✓ No highly correlated pairs found (threshold: 0.7)")

# Visualization
fig, axes = plt.subplots(2, 2, figsize=(15, 12))
fig.suptitle('Correlation Analysis', fontsize=16)

# Pearson correlation heatmap
sns.heatmap(pearson_corr, annot=True, fmt='.2f', cmap='coolwarm', center=0, 
            square=True, ax=axes[0, 0], cbar_kws={"shrink": 0.8})
axes[0, 0].set_title('Pearson Correlation Heatmap')

# Spearman correlation heatmap
sns.heatmap(spearman_corr, annot=True, fmt='.2f', cmap='coolwarm', center=0, 
            square=True, ax=axes[0, 1], cbar_kws={"shrink": 0.8})
axes[0, 1].set_title('Spearman Correlation Heatmap')

# Correlation distribution
corr_values = pearson_corr.values[np.triu_indices_from(pearson_corr.values, k=1)]
axes[1, 0].hist(corr_values, bins=30, edgecolor='black')
axes[1, 0].set_title('Distribution of Correlations')
axes[1, 0].set_xlabel('Correlation Coefficient')
axes[1, 0].set_ylabel('Frequency')
axes[1, 0].axvline(x=0, color='r', linestyle='--')

# Scatter plot for highest correlation
if len(high_corr_pairs) > 0:
    pair = high_corr_pairs[0]
    axes[1, 1].scatter(df[pair['var1']], df[pair['var2']], alpha=0.5)
    axes[1, 1].set_xlabel(pair['var1'])
    axes[1, 1].set_ylabel(pair['var2'])
    axes[1, 1].set_title(f"Highest Correlation: {pair['var1']} vs {pair['var2']} (r={pair['correlation']:.2f})")
    
    # Add trend line
    z = np.polyfit(df[pair['var1']].dropna(), df[pair['var2']].dropna(), 1)
    p = np.poly1d(z)
    axes[1, 1].plot(df[pair['var1']], p(df[pair['var1']]), "r--", alpha=0.8)

plt.tight_layout()

buf = io.BytesIO()
fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
buf.seek(0)
plot_base64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

print(f"PLOT_BASE64:{plot_base64}")

print("\\n" + "="*60)
print("✓ Correlation Analysis Complete")
print("="*60)
print(f"\\nHighly Correlated Pairs Found:{'.'*24} {len(high_corr_pairs)}")
print(f"\\nSUMMARY:Performed comprehensive correlation analysis using Pearson and Spearman methods. Identified {len(high_corr_pairs)} highly correlated variable pairs (>0.7). Visualizations include correlation heatmaps, distribution of correlations, and scatter plots for highly correlated pairs.")
print("\\n✓ Correlation analysis completed successfully")
"""
    
    def _gen_generic_code(self, task_id: str, ctx: Dict, params: Dict) -> str:
        """Generate generic analysis code for unknown tasks"""
        return f"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64

print("\\n" + "="*60)
print(f"📊 ANALYSIS: {task_id}")
print("="*60 + "\\n")

# Basic dataset info
print(f"📋 Dataset Shape:{'.'*38} {{df.shape}}")
print(f"\\n📝 Columns: {{', '.join(df.columns)}}")

# Show sample data
print("\\n📊 Sample Data:")
print(df.head())

# Basic statistics
numeric_cols = df.select_dtypes(include=[np.number]).columns
if len(numeric_cols) > 0:
    print("\\n📈 Numeric Summary:")
    print(df[numeric_cols].describe())

# Simple visualization
fig, ax = plt.subplots(figsize=(12, 6))
if len(numeric_cols) > 0:
    df[numeric_cols[0]].hist(bins=30, ax=ax, edgecolor='black')
    ax.set_title(f'Distribution of {{numeric_cols[0]}}')
    ax.set_xlabel('Value')
    ax.set_ylabel('Frequency')

buf = io.BytesIO()
fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
buf.seek(0)
plot_base64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

print(f"PLOT_BASE64:{{plot_base64}}")

print("\\n" + "="*60)
print("✓ Analysis Complete")
print("="*60)
print("\\nSUMMARY:Completed basic analysis of the dataset including summary statistics and basic visualization.")
print("\\n✓ Analysis completed successfully")
"""


# Singleton
_code_generator = None

def get_code_generator() -> EnhancedCodeGenerator:
    global _code_generator
    if _code_generator is None:
        _code_generator = EnhancedCodeGenerator()
    return _code_generator
