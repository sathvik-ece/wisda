document.addEventListener('click', function (e) {
  var burger = e.target.closest('.burger');
  if (burger) {
    document.getElementById('menu').classList.toggle('open');
  }
});

var form = document.getElementById('appointment-form');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('form-status').textContent =
      'Thank you. Please call 94954 20145 to confirm your appointment slot.';
    form.reset();
  });
}
