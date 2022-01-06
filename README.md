# nasa-api

<h1>Eliachar Feig</h1>
<p>
Email1: efeig15@gmail.com <br>
Email2: eliacharfe@edu.hac.ac.il</p>

<h1>Execution</h1>
<p>
Run npm install in Terminal <br>
Open console, execute : node bin/www
</p>
<p>
Then open your browser at http://localhost:3000
</p>
<p>
In order to enter to the home page where you can extract Nasa photos and then save/delete/clear <br>
all photos, you first need to register and then log in. <br>
In the 1st form you need register a correct format email, a 1st name and last name using <br>
only letters. If the email is already registered in the database you will be notified to <br>
to correct this, else you will be redirected to the 2nd form where you'll have only 1 minute <br>
to register (after confirmation) a password (at least 8 character). if you succeed that <br>
then you will be registered as a new user and redirected to the login page, where you can <br>
log in. When the user log in the program will open a unique session to the particular user <br>
so if the user is saving some images and log out, and later he will log in again he will see <br>
his saved photos (each user have his own list of save photos). When a user is logged in <br>
he cannot be able to access the pages of login/register/password pages. <br>
After the user is logged in the program is executing a connection to NASA API server. The goal is to get mars <br>
photos according to user inputs which includes a date, a mission and a camera. <br>
First it uses 3 fetches to get basic data about the 3 missions (landing date, max <br>
earth date and max sol) and save those in variables. If the fetch is does not work <br>
due to Server break down (404, 504 etc) will insert default data about the missions. <br>
This program open a html page which has a form where the user to insert a valid date<br>
or Sol, a mission name and a camera name. Then, when the user is submitting the<br>
form, do validation and inform the user what is wrong under the particular input field. <br>
If all the inputs are correct then executes another fetch with the data to get the mars <br>
photos and show them in 3 columns with details about each photo and with 2 buttons, 1 button<br>
save the image in a list of saved images (with it details and an option to full screen <br>
mode of the image in a new tab), and 1 button that shows the <br>
photo at full screen mode (in another tab). An image can be saved only once, if the user<br>
tries to save an image that is already saved will get a message throughout a pop up modal<br>
that appears on the screen without the need of scrolling up or down. <br>
There is a button that shows a display bootstrap carousel of the current photos that <br>
displays at the DOM.<br>
  There is option to delete photos one by one and all in once as well. There is also a carousel<br>
  for displaying all photos.<br>
There is a button that open a modal with my personal details.
</p>
<h1>Assumptions</h1>
<p>
  
</p>
