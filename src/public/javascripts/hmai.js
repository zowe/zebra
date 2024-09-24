// $(document).ready(function() {
//     console.log("hmai.js loaded");
//     console.log("lparConfig:", lparConfig);
//     let monitoringIntervals = {};
//     let runningProcesses = {};

//     // Select All functionality
//     $('#select-all-metrics').change(function() {
//         $('input[name="metrics"]').prop('checked', $(this).prop('checked'));
//     });

//     // Update Select All checkbox state when individual metrics are clicked
//     $('input[name="metrics"]').change(function() {
//         if($('input[name="metrics"]:checked').length == $('input[name="metrics"]').length) {
//             $('#select-all-metrics').prop('checked', true);
//         } else {
//             $('#select-all-metrics').prop('checked', false);
//         }
//     });

//     function getSelectedLPAR() {
//         const selectedLPAR = $('#lpar').val();
//         console.log('getSelectedLPAR called, returning:', selectedLPAR);
//         return selectedLPAR;
//     }
//     function getStartButtonForLPAR(lpar) {
//         return $(`#start-hmai-${lpar}`);
//     }

//     function getStopButtonForLPAR(lpar) {
//         return $(`#stop-hmai-${lpar}`);
//     }

//     $('[id^=start-hmai-]').click(function() {
//         const lpar = this.id.split('-')[2];
//         console.log('Start button clicked for LPAR:', lpar);
//         startHMAIForLPAR(lpar);
//     });
//     $('#start-hmai').click(function() {
//         const lpar = getSelectedLPAR();
//         console.log('Start button clicked for LPAR:', lpar);
//         startHMAIForLPAR(lpar);
//     });
//     function startHMAIForLPAR(lpar) {
//         console.log('startHMAIForLPAR called with lpar:', lpar);
        
//         // If lpar is undefined, fall back to the selected LPAR
//         if (!lpar || lpar === 'undefined' || lpar === 'Select LPAR') {
//             lpar = getSelectedLPAR();
//             console.log('Falling back to selected LPAR:', lpar);
//         }
    
//         if (!lpar || lpar === 'undefined' || lpar === 'Select LPAR') {
//             alert('Please select a valid LPAR before starting HMAI');
//             return;
//         }
    
//         console.log('Starting HMAI for LPAR:', lpar);
//         var button = $('#start-hmai');
//         var startDate = $('#hmai-start-date').val();
//         var endDate = $('#hmai-end-date').val();
//         var continuousMonitoring = $('#continuous-monitoring').is(':checked');
    
//         var selectedMetrics = getSelectedMetrics();
    
//         console.log('HMAI start parameters:', { 
//             lpar, 
//             startDate, 
//             endDate, 
//             continuousMonitoring, 
//             selectedMetrics 
//         });
    
//         // Disable the button and change text
//         button.prop('disabled', true).text('Starting...');
    
//         $.ajax({
//             url: '/hmai/start',
//             method: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({ 
//                 startDate: startDate, 
//                 endDate: endDate, 
//                 lpar: lpar,
//                 continuousMonitoring: continuousMonitoring,
//                 metrics: selectedMetrics
//             }),
//             success: function(data) {
//                 console.log('HMAI start response:', data);
//                 if (data.success) {
//                     runningProcesses[lpar] = { isRunning: true, continuousMonitoring: continuousMonitoring };
//                     if (continuousMonitoring) {
//                         alert(`HMAI process started successfully for ${lpar} and is now running continuously.`);
//                     } else {
//                         alert(`HMAI process completed successfully for ${lpar}.`);
//                         runningProcesses[lpar].isRunning = false;
//                     }
//                 } else {
//                     alert('HMAI script execution failed: ' + data.message);
//                 }
//             },
//             error: function(jqXHR, textStatus, errorThrown) {
//                 console.error('HMAI start error:', textStatus, errorThrown);
//                 alert('An error occurred while running the HMAI script');
//             },
//             complete: function() {
//                 updateStartButtonState(lpar);
//                 fetchRunningProcesses(); // Fetch the latest status after completion
//                 button.prop('disabled', false).text('Start HMAI');
//             }
//         });
//     }

//     $('[id^=stop-hmai-]').click(function() {
//         const lpar = this.id.split('-')[2];
//         stopHMAIForLPAR(lpar);
//     });

//     function stopHMAIForLPAR(lpar) {
//         if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
//             $.ajax({
//                 url: '/hmai/stop-monitoring',
//                 method: 'POST',
//                 contentType: 'application/json',
//                 data: JSON.stringify({ lpar: lpar }),
//                 success: function(data) {
//                     if (data.success) {
//                         delete runningProcesses[lpar];
//                         updateStartButtonState(lpar);
//                         alert(`Stopped HMAI process for ${lpar}`);
//                     } else {
//                         alert('Failed to stop HMAI process: ' + data.message);
//                     }
//                 },
//                 error: function(jqXHR, textStatus, errorThrown) {
//                     console.error('Error stopping HMAI process:', textStatus, errorThrown);
//                     alert('An error occurred while stopping the HMAI process');
//                 },
//                 complete: function() {
//                     fetchRunningProcesses(); // Fetch the latest status after completion
//                 }
//             });
//         } else {
//             alert(`No running HMAI process for ${lpar}`);
//         }
//     }
//     $('#start-hmai-all').click(function() {
//         console.log('Start HMAI for All LPARs button clicked');
//         var button = $(this);
//         button.prop('disabled', true).text('Running...');
    
//         $.ajax({
//             url: '/hmai/start-all',
//             method: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({}),
//             success: function(data) {
//                 console.log('HMAI start-all response:', data);
//                 if (data.success) {
//                     if (Array.isArray(data.startedLpars)) {
//                         updateRunningProcesses(data.startedLpars);
//                         updateAllLparButtons(data.startedLpars);
//                         let message = `HMAI process started for the following LPARs: ${data.startedLpars.join(', ')}`;
//                         if (data.skippedLpars && data.skippedLpars.length > 0) {
//                             message += `\n\nThe following LPARs were skipped:`;
//                             data.skippedLpars.forEach(lpar => {
//                                 if (data.alreadyRunningLpars && data.alreadyRunningLpars.includes(lpar)) {
//                                     message += `\n${lpar}: Process was already running`;
//                                 } else {
//                                     message += `\n${lpar}: Incomplete configuration`;
//                                 }
//                             });
//                         }
//                         alert(message);
//                     } else {
//                         console.error('Invalid response format: startedLpars is not an array');
//                         alert('An error occurred while processing the server response');
//                     }
//                 } else {
//                     alert('HMAI script execution failed: ' + (data.message || 'Unknown error'));
//                 }
//             },
//             error: function(jqXHR, textStatus, errorThrown) {
//                 console.error('HMAI start-all error:', textStatus, errorThrown);
//                 alert('An error occurred while running the HMAI script for all LPARs');
//             },
//             complete: function() {
//                 button.prop('disabled', false).text('Start HMAI for All LPARs');
//                 fetchRunningProcesses(); // Fetch the latest status after completion
//             }
//         });
//     });

//     function updateRunningProcesses(startedLpars) {
//         startedLpars.forEach(lpar => {
//             runningProcesses[lpar] = { isRunning: true, continuousMonitoring: true };
//         });
//     }

//     function updateAllLparButtons(startedLpars) {
//         if (Array.isArray(startedLpars)) {
//             startedLpars.forEach(lpar => {
//                 updateStartButtonState(lpar);
//             });
//         } else {
//             console.error('startedLpars is not an array:', startedLpars);
//         }
//     }

//     function fetchRunningProcesses() {
//         $.ajax({
//             url: '/hmai/running-processes',
//             method: 'GET',
//             success: function(data) {
//                 console.log('Fetched running processes:', data);
//                 runningProcesses = data;
//                 updateAllLparButtons();
//                 updateUIForCurrentLPAR();
//             },
//             error: function(jqXHR, textStatus, errorThrown) {
//                 console.error('Error fetching running processes:', textStatus, errorThrown);
//                 runningProcesses = {};
//                 updateAllLparButtons();
//                 updateUIForCurrentLPAR();
//             }
//         });
//     }

//     function updateUIForCurrentLPAR() {
//         const currentLPAR = getSelectedLPAR();
//         updateStartButtonState(currentLPAR);
//     }

// $('#lpar').change(function() {
//         const selectedLPAR = $(this).val();
//         if (selectedLPAR && selectedLPAR !== 'undefined') {
//             updateUIForCurrentLPAR();
//             updateLPARFields();
//         } else {
//             console.log('No valid LPAR selected');
//         }
//     });

//     function updateStartButtonState(lpar) {
//         const startButton = $('#start-hmai');
//         const stopButton = $('#stop-hmai');
//         if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
//             startButton.prop('disabled', true).text('Running...');
//             if (runningProcesses[lpar].continuousMonitoring) {
//                 stopButton.show();
//             } else {
//                 stopButton.hide();
//             }
//         } else {
//             startButton.prop('disabled', false).text('Start HMAI');
//             stopButton.hide();
//         }
//     }

    

//     fetchRunningProcesses();
//     setInterval(fetchRunningProcesses, 30000);

//     function checkLPARSelected() {
//         const lpar = getSelectedLPAR();
//         if (lpar === 'Select LPAR' || !lpar) {
//             alert('Please select an LPAR before proceeding.');
//             return false;
//         }
//         return true;
//     }

//     function updateLPARFields() {
//         const selectedLPAR = getSelectedLPAR();
//         console.log("Updating fields for LPAR:", selectedLPAR);
//         if (selectedLPAR && lparConfig[selectedLPAR] && lparConfig[selectedLPAR].hmai) {
//             const hmaiConfig = lparConfig[selectedLPAR].hmai;
//             console.log("HMAI config for selected LPAR:", hmaiConfig);
//             if (hmaiConfig.defaultStartDate) {
//                 $('#hmai-start-date').val(hmaiConfig.defaultStartDate);
//                 console.log("Set start date to:", hmaiConfig.defaultStartDate);
//             }
//             if (hmaiConfig.continuousMonitoring !== undefined) {
//                 $('#continuous-monitoring').prop('checked', hmaiConfig.continuousMonitoring);
//                 console.log("Set continuous monitoring to:", hmaiConfig.continuousMonitoring);
//             }
//         } else {
//             console.log("No HMAI config found for selected LPAR");
//         }
//     }

//     updateLPARFields(); // Call once on page load

//     function getSelectedMetrics() {
//         return ['clpr', 'ldev', 'mpb', 'mprank20', 'pgrp', 'port'].filter(metric => 
//             $(`#metric-${metric}`).is(':checked')
//         );
//     }

//     $('#continuous-monitoring').change(function() {
//         if (this.checked) {
//             $('#end-date-container').hide();
//         } else {
//             $('#end-date-container').show();
//         }
//     });

//     $('#start-hmai').click(function() {
//         if (!checkLPARSelected()) return;

//         const lpar = getSelectedLPAR();
//         if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
//             alert(`HMAI process is already running for ${lpar}`);
//             return;
//         }

//         console.log('Start HMAI button clicked for', lpar);
//         var button = $(this);
//         var startDate = $('#hmai-start-date').val();
//         var endDate = $('#hmai-end-date').val();
//         var continuousMonitoring = $('#continuous-monitoring').is(':checked');

//         var selectedMetrics = getSelectedMetrics();

//         console.log('Selected metrics:', selectedMetrics);

//         // Disable the button and change text
//         button.prop('disabled', true).text('Starting...');

//         $.ajax({
//             url: '/hmai/start',
//             method: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({ 
//                 startDate: startDate, 
//                 endDate: endDate, 
//                 lpar: lpar,
//                 continuousMonitoring: continuousMonitoring,
//                 metrics: selectedMetrics
//             }),
//             success: function(data) {
//                 console.log('HMAI start response:', data);
//                 if (data.success) {
//                     runningProcesses[lpar] = { isRunning: true, continuousMonitoring: continuousMonitoring };
//                     if (continuousMonitoring) {
//                         alert(`HMAI process started successfully for ${lpar} and is now running continuously.`);
//                     } else {
//                         alert(`HMAI process completed successfully for ${lpar}.`);
//                         runningProcesses[lpar].isRunning = false;
//                     }
//                 } else {
//                     alert('HMAI script execution failed: ' + data.message);
//                 }
//             },
//             error: function(jqXHR, textStatus, errorThrown) {
//                 console.error('HMAI start error:', textStatus, errorThrown);
//                 alert('An error occurred while running the HMAI script');
//             },
//             complete: function() {
//                 updateStartButtonState(lpar);
//                 fetchRunningProcesses(); // Fetch the latest status after completion
//             }
//         });
//     });

//     $('#stop-hmai').click(function() {
//         const lpar = getSelectedLPAR();
//         if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
//             $.ajax({
//                 url: '/hmai/stop-monitoring',
//                 method: 'POST',
//                 contentType: 'application/json',
//                 data: JSON.stringify({ lpar: lpar }),
//                 success: function(data) {
//                     if (data.success) {
//                         delete runningProcesses[lpar];
//                         updateStartButtonState(lpar);
//                         alert(`Stopped HMAI process for ${lpar}`);
//                     } else {
//                         alert('Failed to stop HMAI process: ' + data.message);
//                     }
//                 },
//                 error: function(jqXHR, textStatus, errorThrown) {
//                     console.error('Error stopping HMAI process:', textStatus, errorThrown);
//                     alert('An error occurred while stopping the HMAI process');
//                 },
//                 complete: function() {
//                     fetchRunningProcesses(); // Fetch the latest status after completion
//                 }
//             });
//         } else {
//             alert(`No running HMAI process for ${lpar}`);
//         }
//     });

//     $('#clear-db').click(function() {
//         if (!checkLPARSelected()) return;
    
//         if (confirm('Are you sure you want to clear all data from the database and HMAI memory?')) {
//             var lpar = getSelectedLPAR();
//             $.ajax({
//                 url: '/hmai/clear-db',
//                 method: 'POST',
//                 contentType: 'application/json',
//                 data: JSON.stringify({ lpar: lpar }),
//                 success: function(data) {
//                     if (data.success) {
//                         alert('Database and HMAI memory cleared successfully: ' + data.message);
//                         // Clear the running process for this LPAR if it exists
//                         if (runningProcesses[lpar]) {
//                             delete runningProcesses[lpar];
//                             updateStartButtonState(lpar);
//                         }
//                     } else {
//                         alert('Failed to clear database and HMAI memory: ' + data.message);
//                     }
//                 },
//                 error: function(jqXHR, textStatus, errorThrown) {
//                     console.error('Error:', textStatus, errorThrown);
//                     alert('An error occurred while clearing the database and HMAI memory');
//                 }
//             });
//         }
//     });

//     $('#get-csv').click(function() {
//         if (!checkLPARSelected()) return;
//         var startDate = $('#csv-start-date').val();
//         var endDate = $('#csv-end-date').val();
//         var lpar = getSelectedLPAR();
    
//         $.ajax({
//             url: '/hmai/get-csv',
//             method: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({ startDate: startDate, endDate: endDate, lpar: lpar }),
//             success: function(response) {
//                 console.log('CSV Data Retrieved:', response);
//                 if (response && response.success && response.data) {
//                     populateTable(response.data);
//                 } else {
//                     alert('Failed to retrieve CSV data: ' + (response.message || 'Unknown error'));
//                 }
//             },
//             error: function(jqXHR, textStatus, errorThrown) {
//                 console.error('Error:', textStatus, errorThrown);
//                 alert('An error occurred while fetching CSV data');
//             }
//         });
//     });

//     $('.download-csv').click(function() {
//         if (!checkLPARSelected()) return;
//         var metric = $(this).data('metric');
//         var startDate = $('#csv-start-date').val();
//         var endDate = $('#csv-end-date').val();
//         var lpar = getSelectedLPAR();
    
//         $.ajax({
//             url: '/hmai/download-csv',
//             method: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({ startDate: startDate, endDate: endDate, lpar: lpar, metric: metric }),
//             xhrFields: {
//                 responseType: 'blob'
//             },
//             success: function(blob, status, xhr) {
//                 var contentType = xhr.getResponseHeader('content-type');
//                 if (contentType === 'application/json') {
//                     var reader = new FileReader();
//                     reader.onload = function() {
//                         var errorObj = JSON.parse(reader.result);
//                         alert('An error occurred: ' + errorObj.message);
//                     };
//                     reader.readAsText(blob);
//                 } else {
//                     var link = document.createElement('a');
//                     link.href = window.URL.createObjectURL(blob);
                    
//                     // Create filename with metric, LPAR name, date, and time
//                     var now = new Date();
//                     var dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
//                     var timeString = now.toTimeString().split(' ')[0].replace(/_/g, ':'); // HH-MM-SS
//                     link.download = `${metric}-${lpar}-${dateString}-${timeString}.csv`;
                    
//                     link.click();
//                 }
//             },
//             error: function(jqXHR, textStatus, errorThrown) {
//                 console.error('Error:', textStatus, errorThrown);
//                 alert('An error occurred while downloading the CSV');
//             }
//         });
//     });
//     function saveHMAIConfig() {
//         const lpar = getSelectedLPAR();
//         if (!lpar) {
//             console.log("No LPAR selected, can't save config");
//             return;
//         }

//         const startDate = $('#hmai-start-date').val();
//         const continuousMonitoring = $('#continuous-monitoring').is(':checked');

//         console.log("Saving HMAI config:", { lpar, startDate, continuousMonitoring });

//         $.ajax({
//             url: '/hmai/save-config',
//             method: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({ 
//                 lpar: lpar,
//                 defaultStartDate: startDate,
//                 continuousMonitoring: continuousMonitoring
//             }),
//             success: function(response) {
//                 console.log("Save config response:", response);
//                 if (response.success) {
//                     console.log('HMAI configuration saved successfully');
//                     // Update the lparConfig object
//                     if (!lparConfig[lpar]) lparConfig[lpar] = {};
//                     if (!lparConfig[lpar].hmai) lparConfig[lpar].hmai = {};
//                     lparConfig[lpar].hmai.defaultStartDate = startDate;
//                     lparConfig[lpar].hmai.continuousMonitoring = continuousMonitoring;
//                 } else {
//                     console.error('Failed to save HMAI configuration:', response.message);
//                 }
//             },
//             error: function(jqXHR, textStatus, errorThrown) {
//                 console.error('Error saving HMAI configuration:', textStatus, errorThrown);
//             }
//         });
//     }

//     // Add event listeners to save configuration when changed
//     $('#hmai-start-date').change(function() {
//         console.log("Start date changed");
//         saveHMAIConfig();
//     });
//     $('#continuous-monitoring').change(function() {
//         console.log("Continuous monitoring changed");
//         saveHMAIConfig();
//     });
//     function populateTable(data) {
//         if (!data) {
//             console.error('No data to populate table.');
//             return;
//         }
    
//         Object.keys(data).forEach(function(metric) {
//             const table = $('#' + metric + '-table');
//             if (table.length === 0) {
//                 console.error(`Table element not found for metric: ${metric}`);
//                 return;
//             }
    
//             table.empty();
    
//             if (data[metric].length > 0) {
//                 console.log(`Populating data for metric: ${metric}`);
//                 // Add headers
//                 const headerRow = $('<tr>');
//                 Object.keys(data[metric][0]).forEach(header => {
//                     headerRow.append($('<th>').text(header));
//                 });
//                 table.append($('<thead>').append(headerRow));
    
//                 // Add data rows
//                 const tbody = $('<tbody>');
//                 data[metric].forEach(row => {
//                     const dataRow = $('<tr>');
//                     Object.values(row).forEach(value => {
//                         dataRow.append($('<td>').text(value));
//                     });
//                     tbody.append(dataRow);
//                 });
//                 table.append(tbody);
//             } else {
//                 table.append('<tr><td colspan="100%">No data available</td></tr>');
//             }
//         });
//     }
// });

$(document).ready(function() {
    console.log("hmai.js loaded");
    console.log("lparConfig:", lparConfig);
    let monitoringIntervals = {};
    let runningProcesses = {};

    // Select All functionality
    $('#select-all-metrics').change(function() {
        $('input[name="metrics"]').prop('checked', $(this).prop('checked'));
    });

    // Update Select All checkbox state when individual metrics are clicked
    $('input[name="metrics"]').change(function() {
        if($('input[name="metrics"]:checked').length == $('input[name="metrics"]').length) {
            $('#select-all-metrics').prop('checked', true);
        } else {
            $('#select-all-metrics').prop('checked', false);
        }
    });

    function getSelectedLPAR() {
        return $('#lpar').val();
    }
    $('#start-hmai-all').click(function() {
        console.log('Start HMAI for All LPARs button clicked');
        var button = $(this);
        button.prop('disabled', true).text('Running...');
    
        $.ajax({
            url: '/hmai/start-all',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({}),
            success: function(data) {
                console.log('HMAI start-all response:', data);
                if (data.success) {
                    updateRunningProcesses(data.startedLpars);
                    updateUIForCurrentLPAR();
                    let message = `HMAI process started for the following LPARs: ${data.startedLpars.join(', ')}`;
                    if (data.skippedLpars.length > 0) {
                        message += `\n\nThe following LPARs were skipped:`;
                        data.skippedLpars.forEach(lpar => {
                            if (data.alreadyRunningLpars.includes(lpar)) {
                                message += `\n${lpar}: Process was already running`;
                            } else {
                                message += `\n${lpar}: Incomplete configuration`;
                            }
                        });
                    }
                    alert(message);
                } else {
                    alert('HMAI script execution failed: ' + data.message);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('HMAI start-all error:', textStatus, errorThrown);
                alert('An error occurred while running the HMAI script for all LPARs');
            },
            complete: function() {
                button.prop('disabled', false).text('Start HMAI for All LPARs');
            }
        });
    });
    function updateRunningProcesses(startedLpars) {
        startedLpars.forEach(lpar => {
            runningProcesses[lpar] = { isRunning: true, continuousMonitoring: true };
        });
    }
    
    function updateAllLparButtons(startedLpars) {
        startedLpars.forEach(lpar => {
            runningProcesses[lpar] = true;
            updateStartButtonState(lpar);
        });
    }
    function fetchRunningProcesses() {
        $.ajax({
            url: '/hmai/running-processes',
            method: 'GET',
            success: function(data) {
                console.log('Fetched running processes:', data);
                runningProcesses = data;
                updateUIForCurrentLPAR();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error fetching running processes:', textStatus, errorThrown);
                runningProcesses = {};
                updateUIForCurrentLPAR();
            }
        });
    }

    function updateUIForCurrentLPAR() {
        const currentLPAR = getSelectedLPAR();
        updateStartButtonState(currentLPAR);
    }
    function updateEndDateVisibility() {
        if ($('#continuous-monitoring').is(':checked')) {
            $('#end-date-container').hide();
        } else {
            $('#end-date-container').show();
        }
    }

    function updateStartButtonState(lpar) {
        const startButton = $('#start-hmai');
        const stopButton = $('#stop-hmai');
        console.log(`Updating button state for ${lpar}:`, runningProcesses[lpar]);
        if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
            startButton.prop('disabled', true).text('Running...');
            if (runningProcesses[lpar].continuousMonitoring) {
                console.log(`Showing stop button for ${lpar}`);
                stopButton.show();
            } else {
                console.log(`Hiding stop button for ${lpar}`);
                stopButton.hide();
            }
        } else {
            startButton.prop('disabled', false).text('Start');
            stopButton.hide();
        }
    }

    $('#lpar').change(function() {
        const selectedLPAR = $(this).val();
        updateStartButtonState(selectedLPAR);
        updateLPARFields();
    });

    fetchRunningProcesses();
    setInterval(fetchRunningProcesses, 10000);

    function checkLPARSelected() {
        const lpar = getSelectedLPAR();
        if (lpar === 'Select LPAR' || !lpar) {
            alert('Please select an LPAR before proceeding.');
            return false;
        }
        return true;
    }

    function updateLPARFields() {
        const selectedLPAR = getSelectedLPAR();
        console.log("Updating fields for LPAR:", selectedLPAR);
        if (selectedLPAR && lparConfig[selectedLPAR] && lparConfig[selectedLPAR].hmai) {
            const hmaiConfig = lparConfig[selectedLPAR].hmai;
            console.log("HMAI config for selected LPAR:", hmaiConfig);
            if (hmaiConfig.defaultStartDate) {
                $('#hmai-start-date').val(hmaiConfig.defaultStartDate);
                console.log("Set start date to:", hmaiConfig.defaultStartDate);
            }
            if (hmaiConfig.continuousMonitoring !== undefined) {
                $('#continuous-monitoring').prop('checked', hmaiConfig.continuousMonitoring);
                console.log("Set continuous monitoring to:", hmaiConfig.continuousMonitoring);
            }
            updateEndDateVisibility();
        } else {
            console.log("No HMAI config found for selected LPAR");
        }
    }

    updateLPARFields(); // Call once on page load

    function getSelectedMetrics() {
        return ['clpr', 'ldev', 'mpb', 'mprank20', 'pgrp', 'port'].filter(metric => 
            $(`#metric-${metric}`).is(':checked')
        );
    }

    $('#continuous-monitoring').change(function() {
        updateEndDateVisibility();
    });

    $('#start-hmai').click(function() {
        if (!checkLPARSelected()) return;
    
        const lpar = getSelectedLPAR();
        if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
            alert(`HMAI process is already running for ${lpar}`);
            return;
        }
    
        const selectedMetrics = getSelectedMetrics();
        if (selectedMetrics.length === 0) {
            alert("Please select at least one metric before starting the process.");
            return;
        }
    
        console.log('Start HMAI button clicked for', lpar);
        var button = $(this);
        var startDate = $('#hmai-start-date').val();
        var endDate = $('#hmai-end-date').val();
        var continuousMonitoring = $('#continuous-monitoring').is(':checked');
    
        // console.log('Selected metrics:', selectedMetrics);
    
        // Immediately update UI to show process is starting
        runningProcesses[lpar] = { isRunning: true, continuousMonitoring: continuousMonitoring };
        updateStartButtonState(lpar);
        alert(`Starting HMAI process for ${lpar}...`);
    
        $.ajax({
            url: '/hmai/start',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ 
                startDate: startDate, 
                endDate: endDate, 
                lpar: lpar,
                continuousMonitoring: continuousMonitoring,
                metrics: selectedMetrics
            }),
            success: function(data) {
                console.log('HMAI start response:', data);
                if (data.success) {
                    if (continuousMonitoring) {
                        alert(`HMAI process started successfully for ${lpar} and is now running continuously.`);
                    } else {
                        alert(`HMAI process completed successfully for ${lpar}.`);
                        runningProcesses[lpar].isRunning = false;
                    }
                } else {
                    alert('HMAI script execution failed: ' + data.message);
                    runningProcesses[lpar].isRunning = false;
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('HMAI start error:', textStatus, errorThrown);
                alert('An error occurred while running the HMAI script');
                runningProcesses[lpar].isRunning = false;
            },
            complete: function() {
                updateStartButtonState(lpar);
                fetchRunningProcesses(); // Fetch the latest status after completion
            }
        });
    });

    $('#stop-hmai').click(function() {
        const lpar = getSelectedLPAR();
        if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
            $.ajax({
                url: '/hmai/stop-monitoring',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ lpar: lpar }),
                success: function(data) {
                    if (data.success) {
                        delete runningProcesses[lpar];
                        updateStartButtonState(lpar);
                        alert(`Stopped HMAI process for ${lpar}`);
                        fetchRunningProcesses(); // Fetch the latest status after stopping
                    } else {
                        alert('Failed to stop HMAI process: ' + data.message);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Error stopping HMAI process:', textStatus, errorThrown);
                    alert('An error occurred while stopping the HMAI process');
                }
            });
        } else {
            alert(`No running HMAI process for ${lpar}`);
        }
    });

    $('#clear-db').click(function() {
        if (!checkLPARSelected()) return;
    
        if (confirm('Are you sure you want to clear all data from the database and HMAI memory?')) {
            var lpar = getSelectedLPAR();
            $.ajax({
                url: '/hmai/clear-db',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ lpar: lpar }),
                success: function(data) {
                    if (data.success) {
                        alert('Database and HMAI memory cleared successfully: ' + data.message);
                        // Clear the running process for this LPAR if it exists
                        if (runningProcesses[lpar]) {
                            delete runningProcesses[lpar];
                            updateStartButtonState(lpar);
                        }
                    } else {
                        alert('Failed to clear database and HMAI memory: ' + data.message);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Error:', textStatus, errorThrown);
                    alert('An error occurred while clearing the database and HMAI memory');
                }
            });
        }
    });

    $('#get-csv').click(function() {
        if (!checkLPARSelected()) return;
        var startDate = $('#csv-start-date').val();
        var endDate = $('#csv-end-date').val();
        var lpar = getSelectedLPAR();
        var button = $(this);
        button.prop('disabled', true).text('Running...');
    
        $.ajax({
            url: '/hmai/get-csv',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ startDate: startDate, endDate: endDate, lpar: lpar }),
            success: function(response) {
                console.log('CSV Data Retrieved:', response);
                if (response && response.success && response.data) {
                    populateTable(response.data);
                } else {
                    alert('Failed to retrieve CSV data: ' + (response.message || 'Unknown error'));
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error:', textStatus, errorThrown);
                alert('An error occurred while fetching CSV data');
            },
            complete: function() {
                
                button.prop('disabled', false).text('Get CSV');
            }
        });
    });

    $('.download-csv').click(function() {
        if (!checkLPARSelected()) return;
        var metric = $(this).data('metric');
        var startDate = $('#csv-start-date').val();
        var endDate = $('#csv-end-date').val();
        var lpar = getSelectedLPAR();
    
        $.ajax({
            url: '/hmai/download-csv',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ startDate: startDate, endDate: endDate, lpar: lpar, metric: metric }),
            xhrFields: {
                responseType: 'blob'
            },
            success: function(blob, status, xhr) {
                var contentType = xhr.getResponseHeader('content-type');
                if (contentType === 'application/json') {
                    var reader = new FileReader();
                    reader.onload = function() {
                        var errorObj = JSON.parse(reader.result);
                        alert('An error occurred: ' + errorObj.message);
                    };
                    reader.readAsText(blob);
                } else {
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    
                    // Create filename with metric, LPAR name, date, and time
                    var now = new Date();
                    var dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
                    var timeString = now.toTimeString().split(' ')[0].replace(/_/g, ':'); // HH-MM-SS
                    link.download = `${metric}-${lpar}-${dateString}-${timeString}.csv`;
                    
                    link.click();
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error:', textStatus, errorThrown);
                alert('An error occurred while downloading the CSV');
            }
        });
    });
    function saveHMAIConfig() {
        const lpar = getSelectedLPAR();
        if (!lpar) {
            console.log("No LPAR selected, can't save config");
            return;
        }

        const startDate = $('#hmai-start-date').val();
        const continuousMonitoring = $('#continuous-monitoring').is(':checked');

        console.log("Saving HMAI config:", { lpar, startDate, continuousMonitoring });

        $.ajax({
            url: '/hmai/save-config',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ 
                lpar: lpar,
                defaultStartDate: startDate,
                continuousMonitoring: continuousMonitoring
            }),
            success: function(response) {
                console.log("Save config response:", response);
                if (response.success) {
                    console.log('HMAI configuration saved successfully');
                    // Update the lparConfig object
                    if (!lparConfig[lpar]) lparConfig[lpar] = {};
                    if (!lparConfig[lpar].hmai) lparConfig[lpar].hmai = {};
                    lparConfig[lpar].hmai.defaultStartDate = startDate;
                    lparConfig[lpar].hmai.continuousMonitoring = continuousMonitoring;
                } else {
                    console.error('Failed to save HMAI configuration:', response.message);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error saving HMAI configuration:', textStatus, errorThrown);
            }
        });
    }

    // Add event listeners to save configuration when changed
    $('#hmai-start-date').change(function() {
        console.log("Start date changed");
        saveHMAIConfig();
    });
    $('#continuous-monitoring').change(function() {
        console.log("Continuous monitoring changed");
        saveHMAIConfig();
    });
    function populateTable(data) {
        if (!data) {
            console.error('No data to populate table.');
            return;
        }
    
        Object.keys(data).forEach(function(metric) {
            const table = $('#' + metric + '-table');
            if (table.length === 0) {
                console.error(`Table element not found for metric: ${metric}`);
                return;
            }
    
            table.empty();
    
            if (data[metric].length > 0) {
                console.log(`Populating data for metric: ${metric}`);
                // Add headers
                const headerRow = $('<tr>');
                Object.keys(data[metric][0]).forEach(header => {
                    headerRow.append($('<th>').text(header));
                });
                table.append($('<thead>').append(headerRow));
    
                // Add data rows
                const tbody = $('<tbody>');
                data[metric].forEach(row => {
                    const dataRow = $('<tr>');
                    Object.values(row).forEach(value => {
                        dataRow.append($('<td>').text(value));
                    });
                    tbody.append(dataRow);
                });
                table.append(tbody);
            } else {
                table.append('<tr><td colspan="100%">No data available</td></tr>');
            }
        });
    }
});