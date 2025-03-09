$(document).ready(function() {
    console.log("cache.js loaded");
    let runningProcesses = {};

    function getSelectedLPAR() {
        return $('#lpar').val();
    }

    function updateEndDateVisibility() {
        if ($('#cache-continuous-monitoring').is(':checked')) {
            $('#cache-end-date-container').hide();
        } else {
            $('#cache-end-date-container').show();
        }
    }

    function updateStartButtonState(lpar) {
        const startButton = $('#start-cache');
        const stopButton = $('#stop-cache');
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
        if (selectedLPAR && lparConfig[selectedLPAR] && lparConfig[selectedLPAR].rmfmon1 && lparConfig[selectedLPAR].rmfmon1.cache) {
            const cacheConfig = lparConfig[selectedLPAR].rmfmon1.cache;
            if (cacheConfig.startDate) {
                $('#cache-start-date').val(cacheConfig.startDate);
            }
            if (cacheConfig.continuousMonitoring !== undefined) {
                $('#cache-continuous-monitoring').prop('checked', cacheConfig.continuousMonitoring);
            }
            updateEndDateVisibility();
        }
    }

    $('#cache-continuous-monitoring').change(function() {
        updateEndDateVisibility();
    });

    updateLPARFields();

    $('#start-cache').click(function() {
        if (!checkLPARSelected()) return;

        const lpar = getSelectedLPAR();
        if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
            alert(`Cache process is already running for ${lpar}`);
            return;
        }

        var startDate = $('#cache-start-date').val();
        var endDate = $('#cache-end-date').val();
        var continuousMonitoring = $('#cache-continuous-monitoring').is(':checked');

        runningProcesses[lpar] = { isRunning: true, continuousMonitoring: continuousMonitoring };
        updateStartButtonState(lpar);

        $.ajax({
            url: '/cache/start',
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
                        alert(`Cache process started successfully for ${lpar} and is now running continuously.`);
                    } else {
                        alert(`Cache process completed successfully for ${lpar}.`);
                        runningProcesses[lpar].isRunning = false;
                    }
                } else {
                    alert('Cache process execution failed: ' + data.message);
                    runningProcesses[lpar].isRunning = false;
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Cache start error:', textStatus, errorThrown);
                runningProcesses[lpar].isRunning = false;
            },
            complete: function() {
                updateStartButtonState(lpar);
            }
        });
    });

    $('#stop-cache').click(function() {
        const lpar = getSelectedLPAR();
        if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
            $.ajax({
                url: '/cache/stop-monitoring',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ lpar: lpar }),
                success: function(data) {
                    if (data.success) {
                        delete runningProcesses[lpar];
                        updateStartButtonState(lpar);
                        alert(`Stopped Cache process for ${lpar}`);
                    } else {
                        alert('Failed to stop Cache process: ' + data.message);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Error stopping Cache process:', textStatus, errorThrown);
                    alert('An error occurred while stopping the Cache process');
                }
            });
        } else {
            alert(`No running Cache process for ${lpar}`);
        }
    });

    $('#clear-db').click(function() {
        if (!checkLPARSelected()) return;
    
        if (confirm('Are you sure you want to clear all data from the database and Cache memory?')) {
            var lpar = getSelectedLPAR();
            $.ajax({
                url: '/cache/clear-db',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ lpar: lpar }),
                success: function(data) {
                    if (data.success) {
                        alert('Database and Cache memory cleared successfully: ' + data.message);
                        if (runningProcesses[lpar]) {
                            delete runningProcesses[lpar];
                            updateStartButtonState(lpar);
                        }
                    } else {
                        alert('Failed to clear database and Cache memory: ' + data.message);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Error:', textStatus, errorThrown);
                    alert('An error occurred while clearing the database and Cache memory');
                }
            });
        }
    });

    function fetchRunningProcesses() {
        $.ajax({
            url: '/cache/running-processes',
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