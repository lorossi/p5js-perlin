$(document).ready(function() {
  console.log("%cSnooping around? Check the repo! https://github.com/lorossi/painting-bubbles", "color:white;font-size:1.5rem;");
  $(document).on("click keydown", function() {
    $("#instructions").fadeOut(3000);
  });
});
