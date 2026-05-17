# PySpark-Enterprise-Retail-Data-Processing-Pipeline
An automated end-to-end ETL pipeline built using Apache Spark and Python for processing daily retail transaction data. The pipeline performs incremental data ingestion, validation, cleaning, transformation, KPI generation, and optimized Parquet-based storage to simulate real-world enterprise data engineering workflows.

The system automatically checks for daily incoming retail sales files, processes the data only if a new file is available, removes invalid and duplicate records, generates business insights such as revenue trends and regional sales summaries, and stores processed outputs for analytics and reporting purposes.

Features
Automated daily incremental data processing
PySpark-based ETL workflow
Data cleaning and validation
Duplicate and null record handling
KPI generation and aggregations
Spark SQL and window functions
Optimized Parquet storage
Logging and error handling
Automated archival of processed files
Production-style pipeline structure
