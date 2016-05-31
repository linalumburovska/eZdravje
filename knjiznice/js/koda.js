
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

var tabela=[
    {fn: 'Simona', ln: 'Markovska',dr: '1996-10-15T13:40Z',hl: 175, bw: 74, temp: 37.6, s: 119, d: 85, o: 97},
    {fn: 'Trajko', ln: 'Bogdanovski',dr: '1975-08-25T19:55Z',hl: 186, bw: 80, temp: 38.4, s: 125, d: 65, o: 99},
    {fn: 'Marina', ln: 'Burdus',dr: '1940-02-09T01:30Z',hl: 189, bw: 90, temp: 37.5, s: 130, d: 86, o: 95},
];


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
 function generirajPodatke(stPacienta) {
    sessionId=getSessionId();
  
    var t=tabela[stPacienta-1];
    $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
	});
    $.ajax({
    		    url: baseUrl + "/ehr",
    		    type: 'POST',
    		    success: function(ehr){
    		        t.ehrId=ehr.ehrId;
    		        var partyData={
    		            firstNames: t.fn,
		                lastNames: t.ln,
		                dateOfBirth: t.dr,
		                partyAdditionalInfo: [{key: "ehrId", value: ehr.ehrId}]
    		        };
    		        $.ajax({
		                url: baseUrl + "/demographics/party",
		                type: 'POST',
		                contentType: 'application/json',
		                data: JSON.stringify(partyData),
		                success: function(party){
		                    var podatki = {
			            		    "ctx/language": "en",
                        		    "ctx/territory": "SI",
                        		    "ctx/time": '2016-05-31T11:20Z',
                        		    "vital_signs/height_length/any_event/body_height_length": t.hl,
                        		    "vital_signs/body_weight/any_event/body_weight": t.bw,
                        		   	"vital_signs/body_temperature/any_event/temperature|magnitude": t.temp,
                        		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
                        		    "vital_signs/blood_pressure/any_event/systolic": t.s,
                        		    "vital_signs/blood_pressure/any_event/diastolic": t.d,
                        		    "vital_signs/indirect_oximetry:0/spo2|numerator": t.o,
                        	};
                    		var parametriZahteve = {
                    		    ehrId: ehr.ehrId,
                    		    templateId: 'Vital Signs',
                    		    format: 'FLAT',
                    		    committer: 'medicinska sestra Magde Veselinova'
                    		};
                			$.ajax({
                    		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
                    		    type: 'POST',
                    		    contentType: 'application/json',
                    		    data: JSON.stringify(podatki),
                    		    success: function(comp){
                    		        var ehrIds='<br>'+tabela[0].ehrId+'<br>'+ tabela[1].ehrId+'<br>'+ tabela[2].ehrId;
                    		        $("#statusMessage").html("<span class='label label-success fade-in'>Uspešno kreirani tri EHR: " +ehrIds + ".</span>");
                    		    }
	                        })
		                } 
		                    
		            })
    		    }      

    })    		            
}

function generirajPodatkeKlik(){
    for(var i=1; i <= 3; i++){
        generirajPodatke(i);
    }
};
// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
