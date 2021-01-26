# Project Description
   Zowe is a great systems operations tool. One of the systems programmers or performance analyzer's job is to decode SMF/RMF reports to check system's health. Having a generic parser for SMF datasets and/or RMF (or CMF) reports for Zowe would open various opportunities to create/re-use many open-source monitoring tools out there.

# State of the Project
   Zowe SMF/RMF Parsing Engine Currently Support:
  1.	Parsing CPU And Workload RMF Postprocessor Reports
  2.	Parsing CPC, PROC and USAGE RMF Monitor III Reports
  3.	Parsing Realtime Lpar Utilization Report
  4.	Plotting Realtime Lpar Utilization chart using Prometheus and Grafana
  
# Value of Zowe SMF/RMF Parsing Engine
  1.	Enable system programmers/performance analyst to Decode SMF/RMF reports into JSON Format
  2.	Enable Realtime Monitoring of CPU Utilization Through Grafana Dashboards
  
# Project Requirement
  1.	Zowe
      The Project is extending the Zowe API mediation layer and Interaction with the App can occur through the API catalog
  2.	Prometheus
      Prometheus server can be used to scrape custom metrics exposed by the Engine for plugin into Grafana.
  3.	Grafana
      Grafana server is needed to create Realtime monitoring dashboards


