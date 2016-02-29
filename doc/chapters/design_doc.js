{
    _id: '_design/fingerprints',
    views: {
        'find_by_peak_count_and_hue': {
            map: function (fingerprint) {
                var samples = fingerprint.samples;
                var peaks = Array.isArray(samples) &&
                            Array.isArray(samples[0].peaks) &&
                            samples[0].peaks || [];
                var peakCount = peaks.length;

                if (!peakCount) { return; }

                var weight = peaks.reduce(function (acc, peak) {
                    return acc + peak.hue * peak.intensity
                }, 0);

                var ints = peaks.reduce(function (acc, peak) {
                    return acc + peak.intensity
                }, 0);

                var avgHue = weight / ints;

                emit([ peakCount, avgHue ], samples);
            }
        }
    }
}