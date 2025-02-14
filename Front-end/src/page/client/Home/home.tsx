import Banner from "../../../ClientComponents/Banner/Banner";
import InfomationBox from "../../../ClientComponents/InfomationBox/InfomationBox";
import InfomationSlide from "../../../ClientComponents/InfomationBox/InfomationSlide/InfomationSlide";
import RankingBox from "../../../ClientComponents/RankingBox/RankingBox";
import RankingSlide from "../../../ClientComponents/RankingBox/RankingSlide/RankingSlide";
import TitleMenu from "../../../ClientComponents/TitleMenu/TitleMenu";
import ClientLayout from "../Layout";

const Home = () => {
    return (
        <ClientLayout>
            <Banner></Banner>
            <RankingBox>
                <TitleMenu name="Xếp hạng phim" nameSub="Ranking"></TitleMenu>
                <RankingSlide></RankingSlide>
            </RankingBox>
            <InfomationBox>
                <TitleMenu name="Thông tin" nameSub="Infomation"></TitleMenu>
                <InfomationSlide></InfomationSlide>
            </InfomationBox>
        </ClientLayout>
    );
};

export default Home;
