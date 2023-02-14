const data= JSON.parse(document.getElementById("fordata").value)
var ctx = document.getElementById('paymentModeChart').getContext('2d');
var myChart = new Chart(ctx, {
   type: 'doughnut',
   data: {
       labels: ['cod', 'razorpay'],
       datasets: [{
           label: 'Payment Modes',
           data: [data[0].count, data[1].count],
           backgroundColor: [
               'rgba(255, 99, 132, 0.2)',
               'rgba(54, 162, 235, 0.2)'
           ],
           borderColor: [
               'rgba(255, 99, 132, 1)',
               'rgba(54, 162, 235, 1)'
           ],
           borderWidth: 1
       }]
   },
   options: {
       scales: {
           yAxes: [{
               ticks: {
                   beginAtZero: true
               }
           }]
       }
   }
});
