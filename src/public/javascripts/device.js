$(document).ready(function() {
    console.log("device.js loaded");
    let runningProcesses = {};

    function getSelectedLPAR() {
        return $('#lpar').val();
    }

    function updateEndDateVisibility() {
        if ($('#device-continuous-monitoring').is(':checked')) {
            $('#device-end-date-container').hide();
        } else {
            $('#device-end-date-container').show();
        }
    }

    function updateStartButtonState(lpar) {
        const startButton = $('#start-device');
        const stopButton = $('#stop-device');
        if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
            startButton.prop('disabled', true).text('Running...');
            if (runningProcesses[lpar].continuousMonitoring) {
                stopButton.show();
            } else {
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
        if (selectedLPAR && lparConfig[selectedLPAR] && lparConfig[selectedLPAR].rmfmon1 && lparConfig[selectedLPAR].rmfmon1.device) {
            const deviceConfig = lparConfig[selectedLPAR].rmfmon1.device;
            if (deviceConfig.startDate) {
                $('#device-start-date').val(deviceConfig.startDate);
            }
            if (deviceConfig.continuousMonitoring !== undefined) {
                $('#device-continuous-monitoring').prop('checked', deviceConfig.continuousMonitoring);
            }
            updateEndDateVisibility();
        }
    }

    $('#device-continuous-monitoring').change(function() {
        updateEndDateVisibility();
    });

    updateLPARFields();

    $('#start-device').click(function() {
        if (!checkLPARSelected()) return;

        const lpar = getSelectedLPAR();
        if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
            alert(`Device process is already running for ${lpar}`);
            return;
        }

        var startDate = $('#device-start-date').val();
        var endDate = $('#device-end-date').val();
        var continuousMonitoring = $('#device-continuous-monitoring').is(':checked');

        runningProcesses[lpar] = { isRunning: true, continuousMonitoring: continuousMonitoring };
        updateStartButtonState(lpar);

        $.ajax({
            url: '/device/start',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ 
                startDate: startDate, 
                endDate: endDate, 
                lpar: lpar,
                continuousMonitoring: continuousMonitoring
            }),
            success: function(data) {
                if (data.success) {
                    if (continuousMonitoring) {
                        alert(`Device process started successfully for ${lpar} and is now running continuously.`);
                    } else {
                        alert(`Device process completed successfully for ${lpar}.`);
                        runningProcesses[lpar].isRunning = false;
                    }
                } else {
                    alert('Device process execution failed: ' + data.message);
                    runningProcesses[lpar].isRunning = false;
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Device start error:', textStatus, errorThrown);
                runningProcesses[lpar].isRunning = false;
            },
            complete: function() {
                updateStartButtonState(lpar);
            }
        });
    });

    $('#stop-device').click(function() {
        const lpar = getSelectedLPAR();
        if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
            $.ajax({
                url: '/device/stop-monitoring',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ lpar: lpar }),
                success: function(data) {
                    if (data.success) {
                        delete runningProcesses[lpar];
                        updateStartButtonState(lpar);
                        alert(`Stopped Device process for ${lpar}`);
                    } else {
                        alert('Failed to stop Device process: ' + data.message);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Error stopping Device process:', textStatus, errorThrown);
                    alert('An error occurred while stopping the Device process');
                }
            });
        } else {
            alert(`No running Device process for ${lpar}`);
        }
    });

    $('#clear-device-db').click(function() {
        if (!checkLPARSelected()) return;
    
        if (confirm('Are you sure you want to clear all data from the database and Device memory?')) {
            var lpar = getSelectedLPAR();
            $.ajax({
                url: '/device/clear-db',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ lpar: lpar }),
                success: function(data) {
                    if (data.success) {
                        alert('Database and Device memory cleared successfully: ' + data.message);
                        if (runningProcesses[lpar]) {
                            delete runningProcesses[lpar];
                            updateStartButtonState(lpar);
                        }
                    } else {
                        alert('Failed to clear database and Device memory: ' + data.message);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Error:', textStatus, errorThrown);
                    alert('An error occurred while clearing the database and Device memory');
                }
            });
        }
    });

    function fetchRunningProcesses() {
        $.ajax({
            url: '/device/running-processes',
            method: 'GET',
            success: function(data) {
                runningProcesses = data;
                updateStartButtonState(getSelectedLPAR());
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error fetching running processes:', textStatus, errorThrown);
                runningProcesses = {};
                updateStartButtonState(getSelectedLPAR());
            }
        });
    }

    fetchRunningProcesses();
    setInterval(fetchRunningProcesses, 10000);
}); 