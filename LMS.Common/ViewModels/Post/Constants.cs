using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Post
{
    public static class Constants
    {

        public static string Image = "image";
        public static string Video = "video";
        public static string Pdf = "pdf";
        public static string EndMeetingSuccess = "SUCCESS";
        public static string Failed = "FAILED";
        public static string Word = "msword";
        public static string Excel = "vnd.ms-excel";
        public static string UserDoesNotExist = "User does not exist";
        public static string ForgetEmailSentSuccessfully = "Forget Email sent successfully";
        public static string PPT = "vnd.ms-powerpoint";
        public static string Turkey = "Turkey";
        public static string Success = "Success";
        public static string IncorrectPassword = "The password you entered is incorrect";
        public static string EmailNotConfirmed = "email not confirm";
        public static string UserNotFound = "This email is not registered";
        public static string ResetTokenExpired = "reset token expired";
        public static string FolderCantDeleted = "folder can not be deleted";
        public static string FolderDeleted = "folder deleted";
        public static string PostPinnedSuccessfully = "Post pinned successfully";
        public static string PostUnPinnedSuccessfully = "Post unpinned successfully";
        public static string PostIdInvalid = "Invalid postId";
        public const string RequiresAction = "You must complete an additional authentication step.";
        public static string SchoolNameExist = "School name exists";
        public static string ClassOrCourseSharedSuccessfully = "Class/course shared Successfully";
        public static string ClassOrCourseNotSharedSuccessfully = "user/class/course id invalid";
        public static string SchoolNameDoesNotExist = "School name does not exists";
        public static string ClassRatedSuccessfully = "Class rated successfully";
        public static string CourseRatedSuccessfully = "Course rated successfully";
        public static string UserNotLoggedIn = "User is not logged in";
        public static string RatingMustBeBetween1To5 = "Rating must be between 1 to 5";
        public static string ClassNotRatedSuccessfully = "Class not rated successfully";
        public static string CourseNotRatedSuccessfully = "Course not rated successfully";
        public static string StudentDeletedSuccessfully = "Student removed successfully from this school";
        public static string StudentNotExists = "Student not exists in this school";
        public static string ClassOrCourseIdInvalid = "Class/course id invalid";
        public static string TeacherDeletedSuccesfully = "Teacher deleted successfully.";
        public static string FailedToDeleteTeacher = "Failed to delete teacher.";
        public static string ClassOrTeacherIdNotExist = "Class/Teacher id is not exist.";
        public static string CourseOrTeacherIdNotExist = "Course/Teacher id is not exist.";
        public static string FollowerBannedSuccessfully = "Follower banned successfully";
        public static string ClassOrCoursePinnedSuccessfully = "Class/course pinned successfully";
        public static string ClassOrCourseUnPinnedSuccessfully = "Class/course unpinned successfully";
        public static string VideoReadyToStream = "Your video is ready to stream.You can start stream now";
        public static string FollowerOrUserIdNotValid = "FollowerId/UserId not valid";
        public static string TeacherAddedSuccessfully = "Teacher added successfully";
        public static string TeacherUpdatedSuccessfully = "Teacher updated successfully";
        public static string SchoolHasNotStorageSpace = "School has not the required storage space";
        public static string SchoolHasStorageSpace = "School has the required storage space";
        public static string FollowerReportedSuccesfully = "Follower reported succesfully";
        public static string FailedToReport = "Failed to report follower";
        public static string NotificationSettingsCheckedSuccessfully = "Notification settings checked successfully";
        public static string NotificationSettingsNotChecked = "Notification settings not checked successfully";
        public static string PostSavedSuccessully = "Post has been saved successfully";
        public static string PostUnsavedSavedSuccessully = "Post has been unsaved successfully";
        public static string StudentIsBanned = "Student is banned";
        public static string StudentIsUnBanned = "Student is unbanned";

        public static string NoPermissionForBan = "You do not have the permission to ban the student";


        public static string HasAllBannedUser = "All the banned user's are present";

        public static string FollowerBannedSuccessully = "Follower banned successully";
        public static string FollowerUnBannedSuccessully = "Follower unbanned successully";
        public static string FollowerOrSchoolIdNotValid = "FollowerId/SchoolId not valid";
        public static string UserFollowedSuccessully = "User followed successully";
        public static string UserUnFollowedSuccessully = "User unfollowed successully";
        public static string ClassCourseSavedSuccessully = "Class/course saved successully";
        public static string ClassCourseUnSavedSuccessully = "Class/course unSaved successully";
        public static string EnabledLiveStreamSuccessully = "Live Stream Enabled Successully";
        public static string LiveStreamEnableFailed = "Live Stream Enable Failed";

        public static string LiveStreamEnableFailed2 = "Live Stream Enable Failed";
        public static string StatesDoesnotExist = "No state exists for this country";

        public static List<string> StopWords = new List<string>() { "a", "able", "about", "above", "according", "accordingly", "across", "actually", "after", "afterwards", "again", "against", "ain't", "all", "allow", "allows", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "an", "and", "another", "any", "anybody", "anyhow", "anyone", "anything", "anyway", "anyways", "anywhere", "apart", "appear", "appreciate", "appropriate", "are", "aren't", "around", "as", "a's", "aside", "ask", "asking", "associated", "at", "available", "away", "awfully", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "believe", "below", "beside", "besides", "best", "better", "between", "beyond", "both", "brief", "but", "by", "came", "can", "cannot", "cant", "can't", "cause", "causes", "certain", "certainly", "changes", "clearly", "c'mon", "co", "com", "come", "comes", "concerning", "consequently", "consider", "considering", "contain", "containing", "contains", "corresponding", "could", "couldn't", "course", "c's", "currently", "definitely", "described", "despite", "did", "didn't", "different", "do", "does", "doesn't", "doing", "done", "don't", "down", "downwards", "during", "each", "edu", "eg", "eight", "either", "else", "elsewhere", "enough", "entirely", "especially", "et", "etc", "even", "ever", "every", "everybody", "everyone", "everything", "everywhere", "ex", "exactly", "example", "except", "far", "few", "fifth", "first", "five", "followed", "following", "follows", "for", "former", "formerly", "forth", "four", "from", "further", "furthermore", "get", "gets", "getting", "given", "gives", "go", "goes", "going", "gone", "got", "gotten", "greetings", "had", "hadn't", "happens", "hardly", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "hello", "help", "hence", "her", "here", "hereafter", "hereby", "herein", "here's", "hereupon", "hers", "herself", "he's", "hi", "him", "himself", "his", "hither", "hopefully", "how", "howbeit", "however", "how's", "i", "i'd", "ie", "if", "ignored", "i'll", "i'm", "immediate", "in", "inasmuch", "inc", "indeed", "indicate", "indicated", "indicates", "inner", "insofar", "instead", "into", "inward", "is", "isn't", "it", "it'd", "it'll", "its", "it's", "itself", "i've", "just", "keep", "keeps", "kept", "know", "known", "knows", "last", "lately", "later", "latter", "latterly", "least", "less", "lest", "let", "let's", "like", "liked", "likely", "little", "look", "looking", "looks", "ltd", "mainly", "many", "may", "maybe", "me", "mean", "meanwhile", "merely", "might", "more", "moreover", "most", "mostly", "much", "must", "mustn't", "my", "myself", "name", "namely", "nd", "near", "nearly", "necessary", "need", "needs", "neither", "never", "nevertheless", "new", "next", "nine", "no", "nobody", "non", "none", "noone", "nor", "normally", "not", "nothing", "novel", "now", "nowhere", "obviously", "of", "off", "often", "oh", "ok", "okay", "old", "on", "once", "one", "ones", "only", "onto", "or", "other", "others", "otherwise", "ought", "our", "ours", "ourselves", "out", "outside", "over", "overall", "own", "particular", "particularly", "per", "perhaps", "placed", "please", "plus", "possible", "presumably", "probably", "provides", "que", "quite", "qv", "rather", "rd", "re", "really", "reasonably", "regarding", "regardless", "regards", "relatively", "respectively", "right", "said", "same", "saw", "say", "saying", "says", "second", "secondly", "see", "seeing", "seem", "seemed", "seeming", "seems", "seen", "self", "selves", "sensible", "sent", "serious", "seriously", "seven", "several", "shall", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "since", "six", "so", "some", "somebody", "somehow", "someone", "something", "sometime", "sometimes", "somewhat", "somewhere", "soon", "sorry", "specified", "specify", "specifying", "still", "sub", "such", "sup", "sure", "take", "taken", "tell", "tends", "th", "than", "thank", "thanks", "thanx", "that", "thats", "that's", "the", "their", "theirs", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "theres", "there's", "thereupon", "these", "they", "they'd", "they'll", "they're", "they've", "think", "third", "this", "thorough", "thoroughly", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "took", "toward", "towards", "tried", "tries", "truly", "try", "trying", "t's", "twice", "two", "un", "under", "unfortunately", "unless", "unlikely", "until", "unto", "up", "upon", "us", "use", "used", "useful", "uses", "using", "usually", "value", "various", "very", "via", "viz", "vs", "want", "wants", "was", "wasn't", "way", "we", "we'd", "welcome", "well", "we'll", "went", "were", "we're", "weren't", "we've", "what", "whatever", "what's", "when", "whence", "whenever", "when's", "where", "whereafter", "whereas", "whereby", "wherein", "where's", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "who's", "whose", "why", "why's", "will", "willing", "wish", "with", "within", "without", "wonder", "won't", "would", "wouldn't", "yes", "yet", "you", "you'd", "you'll", "your", "you're", "yours", "yourself", "yourselves", "you've", "zero" };
    }

    public static class IzicoSubscriptions
    {
        public static string Monthly = "4664D40E-3940-47A2-B13B-F81781E98CCD";
        public static string Yearly = "84C7F6C6-00D1-417A-A7AF-976D83AA13AC";
        public static string MonthlyWithFreeTrial = "99928740-ef49-44f9-81d3-37fd122da9fe";
        public static string YearlyWithFreeTrial = "aeadd250-6daa-48c5-8075-502b83bc5755";
    }
}
