import Banner from "../../../ClientComponents/Banner/Banner";
import Header from "../../../ClientComponents/Header/Header";
import InfomationBox from "../../../ClientComponents/InfomationBox/InfomationBox";
import InfomationSlide from "../../../ClientComponents/InfomationBox/InfomationSlide/InfomationSlide";
import Navigate from "../../../ClientComponents/Navigate/Navigate";
import RankingBox from "../../../ClientComponents/RankingBox/RankingBox";
import RankingSlide from "../../../ClientComponents/RankingBox/RankingSlide/RankingSlide";
import TitleMenu from "../../../ClientComponents/TitleMenu/TitleMenu";
import Layout from "../Layout";

const Home = () => {
    return (
        <Layout>
            <Banner></Banner>
            <RankingBox>
                <TitleMenu name="Xếp hạng phim" nameSub="Ranking"></TitleMenu>
                <RankingSlide></RankingSlide>
            </RankingBox>
            <InfomationBox>
                <TitleMenu name="Thông tin" nameSub="Infomation"></TitleMenu>
                <InfomationSlide></InfomationSlide>
            </InfomationBox>
        </Layout>
    );
};

export default Home;
