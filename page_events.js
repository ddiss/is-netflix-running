/*
 * Simple Netflix App ping utility
 *
 * Copyright (C) 2019 David Disseldorp
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

window.addEventListener('load', function () {
	function rsp_report_prob(extra) {
		term.writeln('Request succeeded, but we got ' + extra);
		term.write('\x1b[0;31m');	/* red fg */
		term.writeln('The Netflix App is probably reachable on your '
			     + 'device');
		term.write('\x1b[0m');
	}

	function rsp_report_definitely() {
		term.write('\x1b[0;41m');	/* red bg */
		term.writeln('The Netflix App is reachable on your device!');
		term.write('\x1b[0m');
	}

	function rsp_report_prob_not(extra) {
		term.writeln(extra);
		term.write('\x1b[0;47;30m');	/* white bg, black fg */
		term.writeln('The Netflix App is not reachable on your device');
		term.write('\x1b[0m');
	}

	function req_send() {
		term.writeln('Preparing XMLHttpRequest');
		var req = new XMLHttpRequest();

		req.addEventListener('load', function(event) {
			term.writeln('Response received');
			var hdr = req.getResponseHeader('Content-Type');
			if (hdr !== 'application/json') {
				rsp_report_prob('unexpected Content-Type: '
						+ hdr);
				return;
			}
			if (req.response.length !== 9) {
				rsp_report_prob('unexpected response length: '
						+ req.response.length);
				return;
			}
			var rsp_data = req.responseText;
			if (rsp_data !== 'status=ok') {
				rsp_report_prob('unexpected response data: '
						+ rsp_data);
				return;
			}
			rsp_report_definitely();
		});

		req.addEventListener('error', function(event) {
			rsp_report_prob_not('Request failed');
		});

		req.addEventListener('timeout', function(event) {
			rsp_report_prob_not('Request timed out');
		});

		var url = document.createElement('a');
		url.href = 'http://127.0.0.1:9080/';
		req.open('GET', url.href);

		req.timeout = 1000;

		req.send(null);
		term.writeln('Sent GET request to ' + url.href);
	}

	/* start the terminal */
	var term = new Term(60, 14, null, 1000);
	term.open(document.getElementById("term_container"),
		  null);
	term.writeln('Copyright (C) 2019 David Disseldorp');

	/* await button click */
	var btn = document.getElementById("btn_check");
	btn.addEventListener('click', function (event) {
		event.preventDefault();
		req_send();
	});
	term.writeln('Waiting for button press...');
});
