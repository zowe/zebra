# Zowe RMF/SMF parsing Engine Architecture and Design
## Architecture
![](/Documentation/Images/ZebraArchitecture.png)

## Details
1.	**User (request):** User send a request to the zebra App using any of its recognized URL(s).
2.	**GetRequest:** zebra app send a get request to RMF DDS server for post processor or Monitor III data depending on the URL specified by the user. DDS server returns an XML file.
3.	**Parser:** The XML file returned is feed to RMF post processor parser, RMF monitor III parser or CPU utilization parser depending on the URL specified by the user. The parser returned a JSON.
4.	**User (response):** User can view parsed RMF report using a browser or Zowe API Catalog.
5.	**Prom-client:** The JSON returned by CPU utilization parser is used to create custom Prometheus metrics using prom-client library. The custom Prometheus metrics are exposed via /prommetric endpoint by the zebra app.
6.	**Prometheus server:** this server scrape custom Prometheus metrics from zebra app /prommetric endpoint
7.	**Grafana:** Grafana dashboards are built by connecting Grafana to Prometheus server. This dashboard shows CPU utilization chart I Realtime.
